import { ApiProperty } from '@nestjs/swagger'
import { PartialType } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsEmail, IsString } from 'class-validator'
import { IsPhoneNumber, IsPassword, IsUnique } from 'src/custom/class-validator'
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsPassword()
  password: string

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  birthdate: Date

  @IsOptional()
  document?: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  avatar?: string

  @IsOptional()
  role?: Role
}
