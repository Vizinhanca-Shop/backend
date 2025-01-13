import { ApiProperty } from '@nestjs/swagger'
import { PartialType } from '@nestjs/mapped-types'
import { IsOptional, IsEmail, IsNotEmpty } from 'class-validator'
import { CreateUserDto } from './create-user.dto'
import { IsPassword, IsPhoneNumber } from 'src/custom/class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  email?: string

  @IsOptional()
  name?: string

  @IsPhoneNumber()
  @IsOptional()
  cellphone?: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  avatar?: string

  @IsOptional()
  roleId?: number

  @IsOptional()
  wantToBeCalled?: string

  @IsOptional()
  cadastur?: string

  @IsOptional()
  mother_name?: string

  @IsOptional()
  birthdate?: Date

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    example: '2021-09-01T00:00:00.000Z',
  })
  cadasturAt?: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsPassword()
  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  oldPassword: string
}
