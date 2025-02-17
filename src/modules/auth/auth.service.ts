import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { I18nService, I18nContext } from 'nestjs-i18n'

import { UserService } from '../user/user.service'
import { createRecoveryCode, encrypt, jwt } from 'src/utils'
import prisma from 'prisma/instance'
import {
  SignUpDto,
  SignInDto,
  UserCreateResponseDTO,
  SignInCpfDto,
} from './dto/auth.dto'
import { I18nTranslations } from 'src/i18n/generated/i18n.types'
import { Role } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async signIn({ email, password }: SignInDto): Promise<UserCreateResponseDTO> {
    const user = await prisma.user.findUnique({
      where: {
        email,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        password: true,
        status: true,
        avatarUrl: true,
        role: true,
        person: {
          select: {
            name: true,
            birthdate: true,
            cpf: true,
            canac: true,
            city: {
              select: {
                id: true,
                name: true,
              },
            },
            state: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            isPilot: true,
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

    const payload = {
      id: user.id,
      email: user.email,
    }

    const tokens = await jwt.sign(payload)

    const { exp } = jwt.verify(tokens.token)

    await prisma.session.upsert({
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

  async signInCpf({
    cpf,
    password,
  }: SignInCpfDto): Promise<UserCreateResponseDTO> {
    const user = await prisma.user.findFirst({
      where: {
        person: {
          cpf,
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        password: true,
        status: true,
        avatarUrl: true,
        role: true,
        person: {
          select: {
            name: true,
            birthdate: true,
            cpf: true,
            canac: true,
            city: {
              select: {
                id: true,
                name: true,
              },
            },
            state: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            isPilot: true,
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

    const payload = {
      id: user.id,
      email: user.email,
    }

    const tokens = await jwt.sign(payload)

    const { exp } = jwt.verify(tokens.token)

    await prisma.session.upsert({
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

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      avatarUrl: user.avatarUrl,
      role: user.role,
      person: user.person,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    }
  }

  async signUp(
    signupData: SignUpDto,
    file: Express.Multer.File,
  ): Promise<UserCreateResponseDTO> {
    const user = await this.usersService.create(signupData, null, file)

    const city = await prisma.city.findFirst({
      where: {
        id: signupData.cityId,
        stateId: signupData.stateId,
      },
      select: {
        id: true,
      },
    })

    if (!city) {
      throw new BadRequestException({
        message: 'Falha na validação',
        fields: [
          {
            field: 'cityId',
            message: 'Cidade não pertence ao estado selecionado',
          },
        ],
      })
    }

    if (!user) {
      throw new BadRequestException(
        this.i18n.t('auth.signup.error', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const payload = {
      id: user.id,
      email: user.email,
    }

    const tokens = await jwt.sign(payload)

    const updatedUser = await prisma.user.findFirst({
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
            birthdate: true,
            cpf: true,
            canac: true,
            city: {
              select: {
                id: true,
                name: true,
              },
            },
            state: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            isPilot: true,
          },
        },
      },
    })

    return {
      ...updatedUser,
      ...tokens,
    }
  }

  async signOut(userId: number) {
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    })

    return {
      message: 'Sessão finalizada',
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

  async forgotPassword(data: { email: string; send_to?: 'email' | 'sms' }) {
    const { email } = data
    const user = await this.usersService.findOneByEmail(email)

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('auth.user.not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const hasCode = await prisma.userRecoveryCode.findUnique({
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
      await prisma.userRecoveryCode.delete({
        where: {
          userId: user.id,
        },
      })
    }

    const code = await createRecoveryCode()

    const expiredAt = new Date(Date.now() + 60000 * 30)

    await prisma.userRecoveryCode.create({
      data: {
        code: +code,
        expiredAt,
        userId: user.id,
      },
    })

    return {
      message: 'Código enviado',
    }
  }

  async forgotPasswordCode(code: string) {
    const userCode = await prisma.userRecoveryCode.findUnique({
      where: {
        code: +code,
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
    const userCode = await prisma.userRecoveryCode.findUnique({
      where: {
        code: +code,
        user: { status: 'ACTIVE' },
      },
      select: {
        expiredAt: true,
        used: true,
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

    if (userCode.used) {
      throw new BadRequestException(
        this.i18n.t('auth.forget_password.invalid_code', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    return this.i18n.t('auth.forget_password.valid_code', {
      lang: I18nContext.current().lang,
    })
  }

  async receiveCodeToValidateEmail(email: string, code: string) {
    try {
      const userCode = await prisma.confirmationCode.findUnique({
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

      await prisma.confirmationCode.delete({
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
    const code = await createRecoveryCode()

    const expiredAt = new Date(Date.now() + 60000 * 30)

    await prisma.confirmationCode.upsert({
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

    // await this.sendgrid.sendEmail({
    //   to: email,
    //   subject: this.i18n.t('auth.forget_password.send_code', {
    //     args: { code },
    //   }),
    //   html: this.i18n.t('auth.forget_password.send_code', {
    //     args: { code },
    //   }),
    // })
  }

  async forgotPasswordChange(password: string, code: string) {
    try {
      const userCode = await prisma.userRecoveryCode.findUnique({
        where: {
          code: +code,
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

      const user = await prisma.user.update({
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

      await prisma.userRecoveryCode.delete({
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
