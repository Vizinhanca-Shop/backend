import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsEmail } from 'class-validator'
import { IsPhoneNumber, IsPassword, IsUnique } from 'src/custom/class-validator'

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @IsUnique('user', 'email')
  email: string

  @IsPassword()
  password: string

  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsUnique('person', 'document')
  document?: string

  @IsPhoneNumber()
  @IsUnique('person', 'cellphone')
  cellphone: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  avatar?: string
}

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  password: string
}
export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  email: string
  @IsNotEmpty()
  locale: string
  @IsOptional()
  send_to?: 'email' | 'sms'
}

export class ForgotPasswordcodeDto {
  @IsNotEmpty()
  code: string
}

export class NewPasswordDto {
  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  code: string
}
