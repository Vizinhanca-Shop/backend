import { ApiProperty } from '@nestjs/swagger'
import { PartialType } from '@nestjs/mapped-types'
import { IsOptional, IsEmail, IsNotEmpty } from 'class-validator'
import { CreateUserDto } from './create-user.dto'
import { IsPassword, IsPhoneNumber } from 'src/custom/class-validator'
import { Role } from '@prisma/client'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  email?: string

  @IsOptional()
  name?: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  avatar?: string

  @IsOptional()
  role?: Role
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsPassword()
  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  oldPassword: string
}
