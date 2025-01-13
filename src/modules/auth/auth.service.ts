import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { I18nService, I18nContext } from 'nestjs-i18n'

import { UserService } from '../user/user.service'
import { encrypt, jwt, validateCPF } from 'src/utils'
import PrismaClient from 'prisma/instance'
import { SignUpDto, SignInDto } from './dto/auth.dto'
import { I18nTranslations } from 'src/i18n/generated/i18n.types'
import { Twilio } from 'src/third_party/twilio'
import { SendGrid } from 'src/third_party/sendgrid'
import { S3Service } from 'src/third_party/s3-bucket'
import { defaultRoles } from 'prisma/seeds/default'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private readonly i18n: I18nService<I18nTranslations>,
    private twilio: Twilio,
    private sendgrid: SendGrid,
    private readonly s3Service: S3Service,
  ) {}

  async signIn(
    { email, password }: SignInDto,
    headers: string,
  ): Promise<signInReturnType> {
    const socialUser = await PrismaClient.user.findUnique({
      where: {
        email,
      },
      select: {
        password: true,
        appleOauth: {
          select: {
            id: true,
          },
        },
        facebookOauth: {
          select: {
            id: true,
          },
        },
        googleOauth: {
          select: {
            id: true,
          },
        },
      },
    })

    const isSocialLogin =
      socialUser?.appleOauth ||
      socialUser?.facebookOauth ||
      socialUser?.googleOauth ||
      socialUser?.password === null

    if (isSocialLogin) {
      throw new UnauthorizedException(
        this.i18n.t('auth.user.social_sign_in', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const user = await PrismaClient.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        status: true,
        password: true,
        avatarUrl: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        person: {
          select: {
            name: true,
            cellphone: true,
            birthdate: true,
            mother_name: true,
            nationality: true,
            document: true,
            wantToBeCalled: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('auth.user.not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const isMatch = await encrypt.compare(password, user?.password)

    if (!isMatch) {
      throw new UnauthorizedException(
        this.i18n.t('auth.user.not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    if (headers && headers === 'centerlight-app') {
      if (user.role.id != 3) {
        throw new UnauthorizedException('User is not tourist')
      }
    }

    const payload = {
      id: user.id,
      email: user.email,
    }

    const tokens = await jwt.sign(payload)

    const { exp } = jwt.verify(tokens.token)

    await PrismaClient.session.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        token: tokens.token,
        expiredAt: new Date(exp * 1000),
      },
      update: {
        token: tokens.token,
        expiredAt: new Date(exp * 1000),
      },
    })

    delete user.password

    return {
      ...user,
      ...tokens,
    }
  }

  async signUp(
    signupData: SignUpDto,
    file: Express.Multer.File,
  ): Promise<signUpReturnType> {
    if (signupData?.roleId) {
      const role = await PrismaClient.role.findFirst({
        where: {
          id: +signupData.roleId,
        },
      })

      if (role.name === defaultRoles.admin.name) {
        throw new BadRequestException('You cannot create an admin user')
      }
    }

    if (signupData?.cellphone) {
      const regex = /^(\d{2})(\d{2})(\d{8,9})$/
      const matches = signupData.cellphone.match(regex)

      if (!matches) throw new BadRequestException('Invalid user phone number')
    }

    if (signupData?.document && signupData.roleId != 3) {
      const cpfIsValid = validateCPF(signupData?.document)
      if (!cpfIsValid) throw new BadRequestException('Invalid CPF')
    }

    const user = await this.usersService.create(signupData, null, null)

    if (!user) {
      throw new BadRequestException(
        this.i18n.t('auth.signup.error', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    if (file) {
      const uploadedImage = await this.s3Service.uploadFile(file, 'user-avatar')
      await PrismaClient.avatar.create({
        data: {
          url: uploadedImage.Location,
          key: uploadedImage.Key,
        },
      })

      await PrismaClient.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatarUrl: uploadedImage.Location,
        },
      })
    }

    const payload = {
      id: user.id,
      email: user.email,
    }

    const tokens = await jwt.sign(payload)

    const updatedUser = await PrismaClient.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        email: true,
        status: true,
        avatarUrl: true,
        role: true,
        person: {
          select: {
            name: true,
            cellphone: true,
            nationality: true,
            wantToBeCalled: true,
          },
        },
      },
    })

    if (user?.role?.id === 2) {
      return {
        ...updatedUser,
        ...tokens,
      }
    }

    const createCode = async () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      const hasSamecode = await PrismaClient.userRecoveryCode.findUnique({
        where: {
          code,
        },
      })

      if (!hasSamecode) {
        return code
      }

      return await createCode()
    }

    const code = await createCode()

    const expiredAt = new Date(Date.now() + 60000 * 30)

    await PrismaClient.userRecoveryCode.create({
      data: { code: code, expiredAt, userId: user.id },
    })

    await this.sendgrid.sendEmail({
      to: user.email,
      subject: this.i18n.t('auth.forget_password.send_code', {
        lang: I18nContext.current().lang,
        args: { code },
      }),
      html: this.i18n.t('auth.forget_password.send_code', {
        lang: I18nContext.current().lang,
        args: { code },
      }),
    })

    return {
      ...updatedUser,
      ...tokens,
    }
  }

  async refreshToken(refreshToken: string): Promise<signInReturnType> {
    const validToken = await jwt.verifyRefreshToken(refreshToken)

    const expiredAt = new Date(validToken.exp * 1000)

    if (expiredAt < new Date()) {
      throw new UnauthorizedException('Expired refresh token')
    }

    if (!this.usersService.findOneByEmail(validToken.email)) {
      throw new UnauthorizedException(
        this.i18n.t('auth.user.not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }
    const payload = {
      id: validToken.id,
      email: validToken.email,
      name: validToken.name,
    }
    const tokens = await jwt.sign(payload)

    return tokens
  }

  async forgotPassword(data: {
    email: string
    locale: string
    send_to?: 'email' | 'sms'
  }) {
    const { email, locale, send_to = 'email' } = data
    const user = await this.usersService.findOneByEmail(email)

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('auth.user.not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const hasCode = await PrismaClient.userRecoveryCode.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        expiredAt: true,
      },
    })

    if (hasCode?.expiredAt > new Date()) {
      return {
        message: this.i18n.t('auth.forget_password.already_sent', {
          lang: I18nContext.current().lang,
        }),
      }
    } else if (hasCode?.expiredAt < new Date()) {
      await PrismaClient.userRecoveryCode.delete({
        where: {
          userId: user.id,
        },
      })
    }

    const createCode = async () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      const hasSamecode = await PrismaClient.userRecoveryCode.findUnique({
        where: {
          code,
        },
      })

      if (!hasSamecode) {
        return code
      }

      return await createCode()
    }

    const code = await createCode()

    const expiredAt = new Date(Date.now() + 60000 * 30)

    await PrismaClient.userRecoveryCode.create({
      data: {
        code: code,
        expiredAt,
        userId: user.id,
      },
    })

    if (send_to === 'email') {
      await this.sendgrid.sendEmail({
        to: user.email,
        subject: this.i18n.t('auth.forget_password.send_code', {
          lang: locale,
          args: { code },
        }),
        html: this.i18n.t('auth.forget_password.send_code', {
          lang: locale,
          args: { code },
        }),
      })

      return {
        message: this.i18n.t('auth.forget_password.sent_email'),
      }
    } else if (send_to === 'sms') {
      await this.twilio.sendSMS(
        user.person.cellphone,
        this.i18n.t('auth.forget_password.send_code', {
          lang: locale,
          args: { code },
        }),
      )

      return {
        message: this.i18n.t('auth.forget_password.sent_sms', {
          lang: I18nContext.current().lang,
        }),
      }
    }
  }

  async forgotPasswordCode(code: string) {
    const userCode = await PrismaClient.userRecoveryCode.findUnique({
      where: {
        code: code,
      },
      select: {
        userId: true,
        expiredAt: true,
      },
    })

    if (!userCode) {
      throw new BadRequestException(
        this.i18n.t('auth.forget_password.invalid_code', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    if (userCode.expiredAt < new Date()) {
      throw new BadRequestException(
        this.i18n.t('auth.forget_password.expired_code', {
          lang: I18nContext.current().lang,
        }),
      )
    }
    return this.i18n.t('auth.forget_password.valid_code', {
      lang: I18nContext.current().lang,
    })
  }

  async validateUserWithCode(code: string) {
    const userCode = await PrismaClient.userRecoveryCode.findUnique({
      where: {
        code: code,
        user: { status: 'ANALYSIS' },
      },
      select: {
        expiredAt: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    })

    if (!userCode) {
      throw new BadRequestException(
        this.i18n.t('auth.forget_password.invalid_code', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    if (userCode.expiredAt < new Date()) {
      throw new BadRequestException(
        this.i18n.t('auth.forget_password.expired_code', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    await PrismaClient.userRecoveryCode.deleteMany({
      where: { user: { id: userCode.user.id } },
    })
    await PrismaClient.user.update({
      where: { id: userCode.user.id },
      data: { status: 'ACTIVED' },
    })

    return this.i18n.t('auth.forget_password.valid_code', {
      lang: I18nContext.current().lang,
    })
  }

  async receiveCodeToValidateEmail(email: string, code: string) {
    try {
      const userCode = await PrismaClient.confirmationCode.findUnique({
        where: {
          code: code,
          email: email,
        },
      })

      if (!userCode) {
        throw new BadRequestException(
          this.i18n.t('auth.forget_password.invalid_code', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      if (userCode.expiredAt < new Date()) {
        throw new BadRequestException(
          this.i18n.t('auth.forget_password.expired_code', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      await PrismaClient.confirmationCode.delete({
        where: {
          code,
          email,
        },
      })
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async sendEmailConfirmationCode(email: string) {
    const createCode = async () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      const hasCode = await PrismaClient.confirmationCode.findUnique({
        where: { email },
      })

      if (hasCode) {
        return hasCode.code
      }

      return code
    }

    const code = await createCode()

    const expiredAt = new Date(Date.now() + 60000 * 30)

    await PrismaClient.confirmationCode.upsert({
      where: { email },
      create: {
        email,
        expiredAt,
        code: String(code),
      },
      update: {
        email,
        expiredAt,
        code: String(code),
      },
    })

    await this.sendgrid.sendEmail({
      to: email,
      subject: this.i18n.t('auth.forget_password.send_code', {
        args: { code },
      }),
      html: this.i18n.t('auth.forget_password.send_code', {
        args: { code },
      }),
    })
  }

  async forgotPasswordChange(password: string, code: string) {
    try {
      const userCode = await PrismaClient.userRecoveryCode.findUnique({
        where: {
          code: code,
        },
        select: {
          userId: true,
          expiredAt: true,
        },
      })

      if (!userCode) {
        throw new BadRequestException(
          this.i18n.t('auth.forget_password.invalid_code', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      if (userCode.expiredAt < new Date()) {
        throw new BadRequestException(
          this.i18n.t('auth.forget_password.expired_code', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      const user = await PrismaClient.user.update({
        where: {
          id: userCode.userId,
        },
        data: {
          password: await encrypt.hash(password),
        },
      })

      if (!user) {
        throw new BadRequestException(
          this.i18n.t('auth.forget_password.password_change_error', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      await PrismaClient.userRecoveryCode.delete({
        where: {
          userId: userCode.userId,
        },
      })
      return {
        message: this.i18n.t('auth.forget_password.password_changed', {
          lang: I18nContext.current().lang,
        }),
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }
}
