import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator'
import { IsPassword } from 'src/custom/class-validator'
import { IsEmail, IsEnum, IsString, IsNumber } from 'class-validator'
import { Role, UserStatus } from '@prisma/client'

import { PersonDTO } from './person.dto'
import { Transform } from 'class-transformer'
import { IsCpf } from 'src/custom/class-validator/isCpf'

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
  cpf?: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  avatar?: string

  @IsOptional()
  role?: Role

  @IsNotEmpty()
  stateId: number

  @IsNotEmpty()
  cityId: number

  @IsBoolean()
  isPilot: boolean
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string

  @IsPassword()
  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  birthdate?: string

  @IsString()
  @IsOptional()
  @IsCpf()
  cpf?: string

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  avatar?: string

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  stateId?: number

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  cityId?: number

  @IsString()
  @IsOptional()
  canac?: string

  @IsOptional()
  @IsBoolean()
  isPilot?: boolean
}

export class AvatarDTO {
  @IsString()
  @ApiProperty({ example: 'api.centerlight.com.br/media/avatar.jpg' })
  url: string
}

export class UserDTO {
  @IsNumber()
  @ApiProperty({ example: 1 })
  id: number

  @IsEmail()
  @ApiProperty({ example: 'user@centerlight.com.br' })
  email: string

  @IsEnum(Role)
  @ApiProperty({ enum: Role, example: 'USER' })
  role: Role

  @IsEnum(UserStatus)
  @ApiProperty({ enum: UserStatus, example: 'ACTIVED' })
  status: UserStatus

  @IsString()
  @ApiProperty({ example: 'api.centerlight.com.br/avatar.jpg' })
  avatarUrl: string

  @IsNotEmpty()
  @ApiProperty({ type: PersonDTO, required: false })
  person: PersonDTO

  @IsNotEmpty()
  @ApiProperty({ type: AvatarDTO, required: false })
  avatar?: AvatarDTO
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsPassword()
  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  oldPassword: string
}

export class SearchUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  roleId?: number | string

  @IsOptional()
  page?: number

  @IsOptional()
  limit?: number
}
