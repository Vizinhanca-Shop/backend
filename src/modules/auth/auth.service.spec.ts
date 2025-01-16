import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy } from 'jest-mock-extended'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { I18nService } from 'nestjs-i18n'
import PrismaClient from 'prisma/instance'

describe('AuthService', () => {
  let service: AuthService
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: DeepMockProxy<typeof PrismaClient> | any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key),
          },
        },
        {
          provide: prisma,
          useValue: prisma,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    prisma = module.get<DeepMockProxy<typeof prisma>>(prisma as any)
    userService = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
