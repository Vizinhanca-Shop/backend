import { Test, TestingModule } from '@nestjs/testing'
import { Prisma } from '@prisma/client'
import { DeepMockProxy } from 'jest-mock-extended'
import { UserService } from '../user/user.service'
import { I18nService } from 'nestjs-i18n'
import { I18nTranslations } from '../../i18n/generated/i18n.types'
import { Twilio } from 'src/third_party/twilio'
import { SendGrid } from 'src/third_party/sendgrid'
import { S3Service } from 'src/third_party/s3-bucket'

//TODO: Add tests later

describe('UserService', () => {
  let service: UserService
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: DeepMockProxy<typeof Prisma> | any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let i18n: I18nService<I18nTranslations>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let twilio: Twilio
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sendGrid: SendGrid
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let s3Service: S3Service

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key),
          },
        },
        {
          provide: Prisma,
          useValue: Prisma,
        },
        {
          provide: Twilio,
          useValue: {
            sendSMS: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: SendGrid,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: S3Service,
          useValue: {
            upload: jest.fn().mockResolvedValue(''),
          },
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    prisma = module.get<DeepMockProxy<typeof Prisma>>(Prisma as any)
    i18n = module.get<I18nService<I18nTranslations>>(I18nService)
    twilio = module.get<Twilio>(Twilio)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
