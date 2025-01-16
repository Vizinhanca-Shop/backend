import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
} from 'class-validator'
import { IsPassword, IsUnique } from 'src/custom/class-validator'
import { IsCpf } from 'src/custom/class-validator/isCpf'
import { Transform } from 'class-transformer'
import { UserResponseDTO } from 'src/modules/user/dto/user.dto'

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
  canac?: string

  @IsNotEmpty()
  birthdate: Date

  @IsOptional()
  @IsCpf()
  @IsUnique('person', 'cpf')
  cpf: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  avatar?: string

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  stateId: number

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  cityId: number

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true'
    }

    return value
  })
  isPilot: boolean
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
  @IsEmail()
  email: string
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

export class UserCreateResponseDTO extends UserResponseDTO {
  @ApiProperty()
  token: string

  @ApiProperty()
  refreshToken: string
}

export class UserSignInResponseDTO extends UserResponseDTO {}
