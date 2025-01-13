import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { I18nService, I18nContext } from 'nestjs-i18n'
import PrismaClient from 'prisma/instance'
import {
  CreateAddressInfo,
  CreateReceiptMethodDto,
  CreateUserDto,
  UpdateAddressInfo,
} from './dto/create-user.dto'
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto'
import { SearchUserDto } from './dto/search-user.dts'
import { encrypt } from 'src/utils/encrypt'
import { jwt, removeInvalidValues, validateCPF } from 'src/utils'
import { I18nTranslations } from 'src/i18n/generated/i18n.types'
import { defaultRoles } from 'prisma/seeds/default'
import { S3Service } from 'src/third_party/s3-bucket'
import { UserStatus } from '@prisma/client'
import { AuthMiddlewareRequest } from 'src/types/type'

@Injectable()
export class UserService {
  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    userId?: number,
    file?: Express.Multer.File,
  ) {
    try {
      if (createUserDto?.document) {
        const person = await PrismaClient.person.findUnique({
          where: { document: createUserDto.document },
        })

        if (person) {
          throw new BadRequestException(
            this.i18n.t('auth.user.document_already_exist', {
              lang: I18nContext.current().lang,
            }),
          )
        }
      }

      if (createUserDto?.cadastur) {
        const person = await PrismaClient.person.findUnique({
          where: { cadastur: createUserDto.cadastur },
        })

        if (person) {
          throw new BadRequestException(
            this.i18n.t('auth.user.cadastur_already_exists', {
              lang: I18nContext.current().lang,
            }),
          )
        }
      }

      if (createUserDto?.email) {
        const user = await PrismaClient.user.findUnique({
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

      if (createUserDto?.cellphone) {
        const person = await PrismaClient.person.findUnique({
          where: { cellphone: createUserDto.cellphone },
        })

        if (person) {
          throw new BadRequestException(
            this.i18n.t('auth.user.cellphone_already_exists', {
              lang: I18nContext.current().lang,
            }),
          )
        }
      }

      const adminRole = await PrismaClient.role.findFirst({
        where: {
          name: defaultRoles.admin.name,
        },
        select: { id: true },
      })

      if (createUserDto?.roleId === adminRole.id) {
        //Sign-up use this service to create a user, this is a double check to avoid a user to create an admin user
        if (!userId) {
          throw new UnauthorizedException(
            'User does not have permission to create an admin user',
          )
        }

        const user = await PrismaClient.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            role: {
              select: {
                id: true,
              },
            },
          },
        })

        if (user.role.id !== adminRole.id) {
          throw new UnauthorizedException(
            'User does not have permission to create an admin user',
          )
        }
      }

      //added user roleId if not has roleId in createUserDto
      if (!createUserDto?.roleId) {
        const userRole = await PrismaClient.role.findFirst({
          where: {
            name: defaultRoles.user.name,
          },
        })

        createUserDto.roleId = userRole.id
      }

      const { email, password, ...personData } = createUserDto
      delete personData.roleId
      delete personData.avatar

      const user = await PrismaClient.user.create({
        data: {
          email: email,
          password: await encrypt.hash(password),
          roleId: +createUserDto.roleId,
          status: userId ? 'ACTIVED' : 'ANALYSIS',
          person: {
            create: {
              ...personData,
            },
          },
        },
        select: {
          id: true,
          email: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          avatarUrl: true,
          person: {
            select: {
              name: true,
              cellphone: true,
              cadastur: true,
              cadasturAt: true,
              nationality: true,
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
        const uploadedImage = await this.s3Service.uploadFile(
          file,
          'user-avatar',
        )
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

        return PrismaClient.user.findFirst({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
            avatarUrl: true,
            person: {
              select: {
                name: true,
                cellphone: true,
                cadastur: true,
                cadasturAt: true,
                nationality: true,
              },
            },
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

    const count = await PrismaClient.user.count({
      where: filters,
    })

    const users = await PrismaClient.user.findMany({
      where: filters,
      select: {
        id: true,
        email: true,
        createdAt: true,
        status: true,
        tourPayment: {
          where: {
            status: 'PAID',
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
        person: {
          select: {
            name: true,
            cellphone: true,
            cadastur: true,
            cadasturAt: true,
            nationality: true,
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

    const data = users.filter((user) => user?.status !== 'ANALYSIS')
    const pages = data.length > 0 ? Math.ceil(count / limit) : 0

    const meta = {
      nextPage: pages > page ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalPages: pages,
    }

    return {
      meta,
      data,
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

    const users = await PrismaClient.user.findMany({
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
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
        person: {
          select: {
            name: true,
            cellphone: true,
            cadastur: true,
            cadasturAt: true,
            nationality: true,
            createdAt: true,
          },
        },
        guideSummary: {
          select: {
            totalBalance: true,
            totalSales: true,
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

    const user = await PrismaClient.user.update({
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
    const user = await PrismaClient.user.findUnique({
      where: { email, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
        person: {
          select: {
            name: true,
            cellphone: true,
            cadastur: true,
            cadasturAt: true,
            nationality: true,
          },
        },
      },
    })

    return user
  }

  async findOneByToken(token: string) {
    const { id } = jwt.verify(token)

    const user = await PrismaClient.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        roleId: true,
        deletedAt: true,
      },
    })

    return user
  }

  async findOneById(id: number) {
    const user = await PrismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        CustomerErrors: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
        person: {
          select: {
            name: true,
            document: true,
            cadastur: true,
            birthdate: true,
            cellphone: true,
            cadasturAt: true,
            mother_name: true,
            nationality: true,
            wantToBeCalled: true,
          },
        },
        customer: true,
        receiptMethod: true,
        customerAddress: true,
        guideSummary: {
          select: {
            totalBalance: true,
            totalSales: true,
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

    return {
      ...user,
      receiptMethod: user.receiptMethod ? user.receiptMethod : null,
    }
  }

  async findAllRoles() {
    return await PrismaClient.role.findMany({
      select: {
        id: true,
        name: true,
      },
    })
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

    const { email, roleId, ...personData } = updateUserDto
    const filtredPersonData = removeInvalidValues(personData)

    if (userExists?.CustomerErrors?.length) {
      await PrismaClient.customerErrors.deleteMany({
        where: { userId: userExists.id },
      })
    }

    if (roleId) {
      const adminRole = await PrismaClient.role.findFirst({
        where: {
          name: defaultRoles.admin.name,
        },
      })

      if (roleId === adminRole.id && userExists.role.id !== adminRole.id) {
        throw new UnauthorizedException(
          this.i18n.t('auth.user.permission_denied', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      const role = await PrismaClient.role.findFirst({
        where: {
          id: +roleId,
        },
      })

      if (!role) {
        throw new BadRequestException(
          this.i18n.t('auth.user.role_not_found', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      await PrismaClient.user.update({
        where: {
          id: +id,
        },
        data: {
          roleId: +roleId,
        },
      })
    }

    if (personData?.document) {
      if (userExists.role.id === 2 || userExists.role.id === 1) {
        const cpfIsValid = validateCPF(updateUserDto.document)
        if (!cpfIsValid) throw new BadRequestException('Cpf invalido')
      }

      const person = await PrismaClient.person.findUnique({
        where: {
          user: {
            id: {
              not: +id,
            },
          },
          document: updateUserDto.document?.replace(/\D/g, ''),
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

    if (personData?.cadastur) {
      const person = await PrismaClient.person.findUnique({
        where: {
          user: {
            id: {
              not: +id,
            },
          },
          cadastur: updateUserDto.cadastur,
        },
      })

      if (person) {
        throw new BadRequestException(
          this.i18n.t('auth.user.cadastur_already_exists', {
            lang: I18nContext.current().lang,
          }),
        )
      }
    }

    if (email) {
      const user = await PrismaClient.user.findUnique({
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

    if (personData?.cellphone) {
      const regex = /^(\d{2})(\d{2})(\d{8,9})$/
      const matches = personData?.cellphone.match(regex)

      if (!matches) throw new BadRequestException('Invalid user phone number')

      const person = await PrismaClient.person.findUnique({
        where: {
          user: {
            id: {
              not: +id,
            },
          },
          cellphone: updateUserDto.cellphone?.replace(/\D/g, ''),
        },
      })

      if (person) {
        throw new BadRequestException(
          this.i18n.t('auth.user.cellphone_already_exists', {
            lang: I18nContext.current().lang,
          }),
        )
      }
    }

    let uploadResponse = null

    if (file) {
      const uploadedImage = await this.s3Service.uploadFile(file, 'user-avatar')
      uploadResponse = uploadedImage
    }

    delete filtredPersonData.avatar

    const updatePerson = await PrismaClient.person.update({
      where: {
        userId: +id,
      },
      data: {
        ...filtredPersonData,
        ...(filtredPersonData?.birthdate && {
          birthdate: new Date(filtredPersonData.birthdate),
        }),
        ...(filtredPersonData?.document && {
          document: filtredPersonData?.document?.replace(/\D/g, ''),
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

    const updatedUser = await PrismaClient.user.update({
      where: {
        id: +id,
      },
      data: {
        ...filtredUserData,
      },
      select: {
        id: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
        guideSummary: true,
        person: {
          select: {
            name: true,
            cellphone: true,
            cadastur: true,
            cadasturAt: true,
            nationality: true,
            wantToBeCalled: true,
          },
        },
      },
    })

    return updatedUser
  }

  async remove(id: number) {
    const user = await PrismaClient.user.update({
      where: {
        id: +id,
      },
      data: {
        deletedAt: new Date(),
        email: `${id}@deleted-account.com`,
        person: {
          update: {
            cellphone: `${id}@deleted-cellphone`,
            cadastur: `${id}@deleted-cadastur`,
          },
        },
      },
      select: {
        id: true,
        person: {
          select: {
            id: true,
            document: true,
          },
        },
      },
    })

    if (user?.person?.document) {
      const maskDocument = `${id}@deleted-${user?.person?.document?.substring(0, 2)}.xxx.xxx-${user?.person?.document?.substring(8, 10)}`

      await PrismaClient.person.update({
        where: {
          id: user.person.id,
        },
        data: {
          document: maskDocument,
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
    const checkPassword = await PrismaClient.user.findUnique({
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

    const user = await PrismaClient.user.update({
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

  async createReceiptMethod(
    data: CreateReceiptMethodDto,
    request: AuthMiddlewareRequest,
  ) {
    try {
      const authenticatedUser = request.user

      const bank = await PrismaClient.banks.findFirst({
        where: { cod_compe: data.bankCompeId },
      })

      if (authenticatedUser.roleId != 1 && data?.userId) {
        if (Number(authenticatedUser?.id) != Number(data?.userId)) {
          throw new BadRequestException(
            this.i18n.t('auth.user.permission_denied', {
              lang: I18nContext.current().lang,
            }),
          )
        }
      }

      if (!bank) {
        throw new BadRequestException(
          this.i18n.t('payment.bank.code_compe_not_found', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      const receiptMethod = await PrismaClient.receiptMethod.findFirst({
        where: { userId: Number(data.userId) || +request.user.id },
      })

      if (receiptMethod) {
        throw new BadRequestException(
          this.i18n.t('auth.user.receipt_method_already_created', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      return await PrismaClient.receiptMethod.create({
        data: {
          agency: data.agency,
          account: data.account,
          receiver: data.receiver,
          accountDigit: data.accountDigit,
          bank: { connect: { cod_compe: bank.cod_compe } },
          ...(data.agencyDigit && { agencyDigit: data.agencyDigit }),
          user: {
            connect: { id: Number(data?.userId) || Number(+request.user.id) },
          },
        },
      })
    } catch (error) {
      throw new BadRequestException({ message: error.message, error })
    }
  }

  async editReceiptMethod(
    data: CreateReceiptMethodDto,
    request: AuthMiddlewareRequest,
  ) {
    try {
      const authenticatedUser = request.user

      const bank = await PrismaClient.banks.findFirst({
        where: { cod_compe: data.bankCompeId },
      })

      if (authenticatedUser.roleId != 1 && data?.userId) {
        if (Number(authenticatedUser?.id) != Number(data?.userId)) {
          throw new BadRequestException(
            this.i18n.t('auth.user.permission_denied', {
              lang: I18nContext.current().lang,
            }),
          )
        }
      }

      if (!bank) {
        throw new BadRequestException(
          this.i18n.t('payment.bank.code_compe_not_found', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      const receiptMethod = await PrismaClient.receiptMethod.findFirst({
        where: { userId: Number(data.userId) || +request.user.id },
      })

      await PrismaClient.customerErrors.deleteMany({
        where: { userId: +request.user.id },
      })

      if (!receiptMethod) {
        throw new BadRequestException(
          this.i18n.t('auth.user.receipt_method_not_created', {
            lang: I18nContext.current().lang,
          }),
        )
      }

      await PrismaClient.receiptMethod.update({
        where: { id: receiptMethod.id },
        data: {
          agency: data.agency,
          updatedAt: new Date(),
          createdAt: new Date(),
          account: data.account,
          receiver: data.receiver,
          agencyDigit: data.agencyDigit,
          accountDigit: data.accountDigit,
          bank: { connect: { cod_compe: bank.cod_compe } },
        },
      })
    } catch (error) {
      throw new BadRequestException({ message: error.message, error })
    }
  }

  async createAddressInfo(addressInfoDto: CreateAddressInfo, userId: number) {
    const userAddress = await PrismaClient.customerAddress.findFirst({
      where: { userId },
    })

    if (userAddress) {
      throw new BadRequestException('User address already added')
    }

    const { line, ...rest } = addressInfoDto
    return await PrismaClient.customerAddress.create({
      data: {
        ...rest,
        line_1: line,
        user: { connect: { id: userId } },
      },
    })
  }

  async updateAddressInfo(addressInfoDto: UpdateAddressInfo, userId: number) {
    const userAddress = await PrismaClient.user.findUnique({
      where: { id: userId },
      include: { customerAddress: true },
    })

    if (!userAddress.customerAddress) {
      throw new BadRequestException('User address not registered')
    }

    await PrismaClient.customerErrors.deleteMany({ where: { userId: userId } })

    return await PrismaClient.customerAddress.update({
      where: { id: userAddress.customerAddress.id, user: { id: userId } },
      data: {
        ...(addressInfoDto.city && { city: addressInfoDto.city }),
        ...(addressInfoDto.country && { country: addressInfoDto.country }),
        ...(addressInfoDto.neighborhood && {
          neighborhood: addressInfoDto.neighborhood,
        }),
        ...(addressInfoDto.state && { state: addressInfoDto.state }),
        ...(addressInfoDto.street && { street: addressInfoDto.street }),
        ...(addressInfoDto.zip_code && { zip_code: addressInfoDto.zip_code }),
        ...(addressInfoDto.line && { line_1: addressInfoDto.line }),
      },
    })
  }
}
