import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { AuthCron } from './auth.cron'
import { S3Service } from 'src/third_party/s3-bucket'

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserService, AuthCron, S3Service],
})
export class AuthModule {}
