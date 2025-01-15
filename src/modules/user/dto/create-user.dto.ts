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

  @IsOptional()
  document?: string

  @IsPhoneNumber()
  cellphone: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  avatar?: string

  @IsOptional()
  role?: Role
}

export class CreateReceiptMethodDto {
  @IsOptional()
  userId: string

  @IsString()
  @IsNotEmpty()
  receiver: string

  @IsString()
  @IsNotEmpty()
  bankCompeId: string

  @IsString()
  @IsNotEmpty()
  account: string

  @IsString()
  @IsNotEmpty()
  accountDigit: string

  @IsString()
  @IsNotEmpty()
  agency: string

  @IsOptional()
  agencyDigit: string
}

export class CreateAddressInfo {
  @IsString()
  line: string

  @IsString()
  zip_code: string

  @IsString()
  street: string

  @IsString()
  neighborhood: string

  @IsString()
  city: string

  @IsString()
  state: string

  @IsString()
  country: string
}

export class UpdateAddressInfo extends PartialType(CreateAddressInfo) {}
