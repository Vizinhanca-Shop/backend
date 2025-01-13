import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { Twilio } from 'src/third_party/twilio'
import { SendGrid } from 'src/third_party/sendgrid'
import { S3Service } from 'src/third_party/s3-bucket'

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserService, Twilio, SendGrid, S3Service],
})
export class AuthModule {}
