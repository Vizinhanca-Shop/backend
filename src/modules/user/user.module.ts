import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { S3Service } from 'src/third_party/s3-bucket'

@Module({
  controllers: [UserController],
  providers: [UserService, S3Service],
})
export class UserModule {}
