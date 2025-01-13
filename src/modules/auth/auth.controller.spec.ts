import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { Twilio } from 'src/third_party/twilio'
import { UserService } from '../user/user.service'
import { I18nService } from 'nestjs-i18n'
import { I18nTranslations } from 'src/i18n/generated/i18n.types'
import { SendGrid } from 'src/third_party/sendgrid'
import { S3Service } from 'src/third_party/s3-bucket'

//TODO: Add tests later

describe('AuthController', () => {
  let controller: AuthController
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: AuthService
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let twilio: Twilio
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let i18n: I18nService<I18nTranslations>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sendGrid: SendGrid
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let s3Service: S3Service

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController)
    service = module.get<AuthService>(AuthService)
    userService = module.get<UserService>(UserService)
    twilio = module.get<Twilio>(Twilio)
    sendGrid = module.get<SendGrid>(SendGrid)
    s3Service = module.get<S3Service>(S3Service)
    i18n = module.get<I18nService<I18nTranslations>>(I18nService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
