import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { I18nService, I18nContext } from 'nestjs-i18n'
import prisma from 'prisma'
import { CreateUserDto } from './dto/user.dto'
import { ChangePasswordDto, UpdateUserDto, SearchUserDto } from './dto/user.dto'
import { encrypt } from 'src/utils/encrypt'
import { jwt, removeInvalidValues, validateCPF } from 'src/utils'
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
    try {
      if (createUserDto?.cpf) {
        const person = await prisma.person.findUnique({
          where: { cpf: createUserDto.cpf },
        })

        if (person) {
          throw new BadRequestException(
            this.i18n.t('auth.user.document_already_exist', {
              lang: I18nContext.current().lang,
            }),
          )
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
          status: UserStatus.ACTIVED,
          person: {
            create: {
              name: personData.name,
              birthdate: personData.birthdate,
              cpf: personData.cpf,
              isPilot: personData?.isPilot,
              state: { connect: { id: +personData.stateId } },
              city: { connect: { id: +personData.cityId } },
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
        const url = process.env.API_URL + '/' + file.path

        console.log({ url })

        return await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            avatarUrl: url,
          },
        })
      }

      return user
    } catch (error) {
      throw new BadRequestException({ message: error.message, error })
    }
  }

  async findAll(query: SearchUserDto, userId: number, limit, page) {
    const filters: any = { deletedAt: null, id: { not: userId } }

    if (query.email) {
      filters.email = { contains: query.email, mode: 'insensitive' }
    }
    if (query.roleId) {
      filters.roleId = {
        equals: +query.roleId,
      }
    }
    if (query.name) {
      filters.person = {
        ...filters.person,
        name: { contains: query.name, mode: 'insensitive' },
      }
    }

    const count = await prisma.user.count({
      where: filters,
    })

    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        email: true,
        createdAt: true,
        status: true,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    })

    if (!users.length) {
      return users
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

  async findGuideNeedsApproval(query: SearchUserDto) {
    const filters: any = { deletedAt: null }

    if (query.email) {
      filters.email = { contains: query.email, mode: 'insensitive' }
    }

    if (query.name) {
      filters.person = {
        ...filters.person,
        name: { contains: query.name, mode: 'insensitive' },
      }
    }

    const users = await prisma.user.findMany({
      where: {
        ...filters,
        role: { id: 2 },
        status: 'ANALYSIS',
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
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
            createdAt: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    return users
  }

  async changeUserStatus(id: number, status: UserStatus) {
    if (!id) {
      throw new BadRequestException(
        this.i18n.t('auth.user.not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    if (!UserStatus[status]) {
      throw new BadRequestException(
        this.i18n.t('auth.user.status_not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const user = await prisma.user.update({
      where: {
        id: +id,
      },
      data: {
        status: status,
      },
    })

    if (!user) {
      throw new BadRequestException('Cannot set status on this user')
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

  async findOneById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        email: true,
        createdAt: true,
        status: true,
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
        person: {
          select: {
            name: true,
            cpf: true,
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
    id: number,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    const userExists = await this.findOneById(+id)

    if (!userExists) {
      throw new BadRequestException(
        this.i18n.t('auth.user.not_found', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const { email, role, ...personData } = updateUserDto
    const filtredPersonData = removeInvalidValues(personData)
    const abc = role
    if (role) {
      const adminRole = Role.ADMIN

      if (role === adminRole && userExists.role !== adminRole) {
        throw new UnauthorizedException(
          this.i18n.t('auth.user.permission_denied', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      await prisma.user.update({
        where: {
          id: +id,
        },
        data: {
          role,
        },
      })
    }

    if (personData?.cpf) {
      const cpfIsValid = validateCPF(updateUserDto.cpf)
      if (!cpfIsValid) throw new BadRequestException('Cpf invalido')

      const person = await prisma.person.findUnique({
        where: {
          user: {
            id: {
              not: +id,
            },
          },
          cpf: updateUserDto.cpf?.replace(/\D/g, ''),
        },
      })

      if (person) {
        throw new BadRequestException(
          this.i18n.t('auth.user.document_already_exist', {
            lang: I18nContext.current().lang,
          }),
        )
      }
    }

    if (email) {
      const user = await prisma.user.findUnique({
        where: {
          email,
          NOT: {
            id: +id,
          },
        },
      })

      if (user) {
        throw new BadRequestException(
          this.i18n.t('auth.user.email_already_exists', {
            lang: I18nContext.current().lang,
          }),
        )
      }
    }

    let uploadResponse = null

    // if (file) {
    //   const uploadedImage = await this.s3Service.uploadFile(file, 'user-avatar')
    //   uploadResponse = uploadedImage
    // }

    delete filtredPersonData.avatar

    const updatePerson = await prisma.person.update({
      where: {
        userId: +id,
      },
      data: {
        ...filtredPersonData,
        ...(filtredPersonData?.birthdate && {
          birthdate: new Date(filtredPersonData.birthdate),
        }),
        ...(filtredPersonData?.cpf && {
          cpf: filtredPersonData?.cpf?.replace(/\D/g, ''),
        }),
      },
    })

    if (!updatePerson) {
      throw new BadRequestException(
        this.i18n.t('auth.user.cellphone_already_exists', {
          lang: I18nContext.current().lang,
        }),
      )
    }

    const userData = uploadResponse
      ? {
          email,
          avatar: {
            upsert: {
              create: {
                url: uploadResponse.Location,
                key: uploadResponse.Key,
              },
              update: {
                url: uploadResponse.Location,
                key: uploadResponse.Key,
              },
            },
          },
        }
      : { email }

    const filtredUserData = removeInvalidValues(userData)

    const updatedUser = await prisma.user.update({
      where: {
        id: +id,
      },
      data: {
        ...filtredUserData,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
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

  async remove(id: number) {
    const user = await prisma.user.update({
      where: {
        id: +id,
      },
      data: {
        deletedAt: new Date(),
        email: `${id}@deleted-account.com`,
        person: {
          update: {
            name: `${id}@deleted-name`,
            cpf: `${id}@deleted-cpf`,
            canac: `${id}@deleted-canac`,
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

    if (user?.person?.cpf) {
      const maskDocument = `${id}@deleted-${user?.person?.cpf?.substring(0, 2)}.xxx.xxx-${user?.person?.cpf?.substring(8, 10)}`

      await prisma.person.update({
        where: {
          id: user.person.id,
        },
        data: {
          cpf: maskDocument,
        },
      })
    }

    if (!user) {
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
