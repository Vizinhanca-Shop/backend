import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { I18nService, I18nContext } from 'nestjs-i18n'
import prisma from 'prisma/instance'
import { CreateUserDto, UserDTO } from './dto/user.dto'
import { ChangePasswordDto, UpdateUserDto, SearchUserDto } from './dto/user.dto'
import { encrypt } from 'src/utils/encrypt'
import { jwt } from 'src/utils'
import { I18nTranslations } from 'src/i18n/generated/i18n.types'
// import { S3Service } from 'src/third_party/s3-bucket'
import { Role, UserStatus } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    // private readonly s3Service: S3Service,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    userId?: number,
    file?: Express.Multer.File,
  ) {
    if (createUserDto?.cpf) {
      const person = await prisma.person.findUnique({
        where: { cpf: createUserDto.cpf },
      })

      if (person) {
        throw new BadRequestException({
          message: 'Falha na validação',
          errors: [
            {
              field: 'cpf',
              message: 'CPF já cadastrado',
            },
          ],
        })
      }
    }

    if (createUserDto?.email) {
      const user = await prisma.user.findUnique({
        where: { email: createUserDto.email },
      })

      if (user) {
        throw new BadRequestException(
          this.i18n.t('auth.user.email_already_exists', {
            lang: I18nContext.current().lang,
          }),
        )
      }
    }

    if (createUserDto?.role === Role.ADMIN) {
      //Sign-up use this service to create a user, this is a double check to avoid a user to create an admin user
      if (!userId) {
        throw new UnauthorizedException(
          'User does not have permission to create an admin user',
        )
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          role: true,
        },
      })

      if (user.role !== Role.ADMIN) {
        throw new UnauthorizedException(
          'User does not have permission to create an admin user',
        )
      }
    }

    const { email, password, ...personData } = createUserDto
    delete personData.role
    delete personData.avatar

    const user = await prisma.user.create({
      data: {
        email: email,
        password: await encrypt.hash(password),
        role: createUserDto.role,
        status: UserStatus.ACTIVE,
        person: {
          create: {
            name: personData.name,
            birthdate: personData.birthdate,
            cpf: personData.cpf,
            isPilot: personData?.isPilot,
            state: { connect: { id: +personData.stateId } },
            city: { connect: { id: +personData.cityId } },
            canac: personData.canac,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        avatarUrl: true,
        person: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.signin.error', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    if (file) {
      const url = process.env.API_URL + '/images/avatar/' + file.filename

      return await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatar: {
            create: {
              url,
            },
          },
        },
      })
    }

    return user
  }

  async findAll(
    query: SearchUserDto,
    userId: number,
    limit: number,
    page: number,
  ) {
    let filters: any = { deletedAt: null, id: { not: userId } }

    if (query.search) {
      filters = {
        ...filters,
        person: {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      }
    }

    const orderBy = [] as any

    if (query.status) {
      orderBy.push({
        status: query.status,
      })
    }

    if (query.name) {
      orderBy.push({
        person: {
          name: query.name,
        },
      })
    }

    if (query.email) {
      orderBy.push({
        email: query.email,
      })
    }

    if (query.role) {
      orderBy.push({
        role: query.role,
      })
    }

    // Default order by createdAt, get the most recent first
    orderBy.push({
      createdAt: 'desc',
    })

    const count = await prisma.user.count({
      where: filters,
    })

    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        email: true,
        status: true,
        role: true,
        avatarUrl: true,
        person: {
          select: {
            name: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    })

    if (!users.length) {
      return {
        meta: {
          nextPage: null,
          previousPage: null,
          totalPages: 0,
        },
        data: [],
      }
    }

    const pages = users.length > 0 ? Math.ceil(count / limit) : 0

    const meta = {
      nextPage: pages > page ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalPages: pages,
    }

    return {
      meta,
      data: users,
    }
  }

  async findOneByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
        person: {
          select: {
            name: true,
          },
        },
      },
    })

    return user
  }

  async findOneByToken(token: string) {
    const { id } = jwt.verify(token)

    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        deletedAt: true,
      },
    })

    return user
  }

  async findOneById(id: number): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        email: true,
        createdAt: true,
        status: true,
        avatarUrl: true,
        person: {
          select: {
            name: true,
            cpf: true,
            canac: true,
            birthdate: true,
            isPilot: true,
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
          },
        },
      },
    })

    if (!user) {
      throw new BadRequestException(
        this.i18n.t('auth.user.not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }
    return user
  }

  async findAllRoles() {
    const roles = Role

    return Object.keys(roles).map((key) => roles[key])
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    const { email, password, status, ...personData } = updateUserDto

    if (personData?.cpf) {
      const person = await prisma.person.findUnique({
        where: {
          user: {
            id: {
              not: userId,
            },
          },
          cpf: updateUserDto.cpf?.replace(/\D/g, ''),
        },
      })

      if (person) {
        throw new BadRequestException({
          message: 'Falha na validação',
          errors: [
            {
              field: 'cpf',
              message: this.i18n.t('auth.user.document_already_exist', {
                lang: I18nContext.current().lang,
              }),
            },
          ],
        })
      }
    }

    if (email) {
      const existUser = await prisma.user.findUnique({
        where: {
          email,
          NOT: {
            id: userId,
          },
        },
      })

      if (existUser) {
        throw new BadRequestException(
          this.i18n.t('auth.user.email_already_exists', {
            lang: I18nContext.current().lang,
          }),
        )
      }
    }

    if (personData?.cityId) {
      const city = await prisma.city.findUnique({
        where: {
          id: personData.cityId,
          stateId: personData.stateId,
        },
        select: {
          id: true,
        },
      })

      if (!city) {
        throw new BadRequestException({
          message: 'Falha na validação',
          errors: [
            {
              field: 'cityId',
              message: 'Cidade não pertence ao estado selecionado',
            },
          ],
        })
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(status && { status }),
        ...(email && { email }),
        ...(password && { password: await encrypt.hash(password) }),
        ...(file && {
          avatar: {
            upsert: {
              create: {
                url: process.env.API_URL + '/images/avatar/' + file.filename,
                key: file.filename,
              },
              update: {
                url: process.env.API_URL + '/images/avatar/' + file.filename,
                key: file.filename,
              },
            },
          },
        }),
        person: {
          update: {
            ...(updateUserDto?.canac && { canac: updateUserDto.canac }),
            ...(updateUserDto?.isPilot && { isPilot: updateUserDto.isPilot }),
            ...(updateUserDto?.name && { name: updateUserDto.name }),
            ...(updateUserDto?.cpf && { cpf: updateUserDto.cpf }),
            ...(updateUserDto?.cityId && { cityId: personData.cityId }),
            ...(updateUserDto?.stateId && { stateId: personData.stateId }),
            ...(updateUserDto?.birthdate && {
              birthdate: updateUserDto.birthdate,
            }),
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        person: {
          select: {
            name: true,
            birthdate: true,
            canac: true,
            city: true,
            cpf: true,
            cityId: true,
            stateId: true,
            isPilot: true,
          },
        },
      },
    })

    return updatedUser
  }

  async remove({ id, user }: { id?: number; user: UserDTO }) {
    let userId = id

    console.log(user)

    // If the user is not an admin, it can only delete itself
    if (user.role !== Role.ADMIN || !userId) {
      userId = user.id
    }

    console.log('adsa', userId)

    const deletedUser = await prisma.user.update({
      where: {
        id: +userId,
      },
      data: {
        deletedAt: new Date(),
        status: UserStatus.INACTIVE,
        email: `${userId}@deleted-account.com`,
        person: {
          update: {
            name: `${userId}@deleted-name`,
            cpf: `${userId}@deleted-cpf`,
            canac: `${userId}@deleted-canac`,
          },
        },
      },
      select: {
        id: true,
        person: {
          select: {
            id: true,
            cpf: true,
          },
        },
      },
    })

    if (!deletedUser) {
      throw new BadRequestException(
        this.i18n.t('auth.user.delete.error', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    return {
      message: this.i18n.t('auth.user.delete.success', {
        lang: I18nContext.current().lang,
      }),
    }
  }

  async changePassword(id: number, data: ChangePasswordDto) {
    const checkPassword = await prisma.user.findUnique({
      where: {
        id: +id,
      },
      select: {
        password: true,
      },
    })

    const isMatch = await encrypt.compare(
      data.oldPassword,
      checkPassword?.password,
    )

    if (!isMatch) {
      throw new BadRequestException(
        this.i18n.t('auth.change_password.not_match', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const user = await prisma.user.update({
      where: {
        id: +id,
      },
      data: {
        password: await encrypt.hash(data.password),
      },
    })

    if (!user) {
      throw new BadRequestException(
        this.i18n.t('auth.change_password.error', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    return {
      message: this.i18n.t('auth.change_password.success', {
        lang: I18nContext.current().lang,
      }),
    }
  }
}
