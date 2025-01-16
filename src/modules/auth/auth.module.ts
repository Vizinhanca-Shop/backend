import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { AuthCron } from './auth.cron'

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserService, AuthCron],
})
export class AuthModule {}
