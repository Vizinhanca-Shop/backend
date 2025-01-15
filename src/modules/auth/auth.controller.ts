import {
  Controller,
  UploadedFile,
  Post,
  Body,
  UseInterceptors,
  Headers,
  BadRequestException,
} from '@nestjs/common'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import {
  SignInDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  SignUpDto,
  ForgotPasswordcodeDto,
  NewPasswordDto,
  UserCreateResponseDTO,
} from './dto/auth.dto'

import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/avatar',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('')
          return cb(null, `${randomName}${file.originalname}`)
        },
      }),
    }),
  )
  signUp(
    @Body() data: SignUpDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserCreateResponseDTO> {
    if (data.isPilot && !data.canac) {
      throw new BadRequestException({
        message: 'Falha na validação',
        fields: [
          {
            field: 'canac',
            message: 'CANAC é obrigatório para pilotos',
          },
        ],
      })
    }

    return this.authService.signUp(data, file)
  }

  @Post('sign-in')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        email: 'user@centerlight.com.br',
        avatarUrl: 'api.centerlight.com.br/avatar/j3kda4M2phÇoson4k5Y.png',
        role: {
          id: 2,
          name: 'user',
        },
        person: {
          name: 'User',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      },
    },
  })
  signIn(
    @Body() data: SignInDto,
    @Headers('x-request-origin') headers: string,
  ) {
    return this.authService.signIn(data, headers)
  }

  @Post('refresh-token')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      },
    },
  })
  refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken)
  }

  @Post('forgot-password')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'Email sent',
    },
  })
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data)
  }

  @Post('forgot-password/code')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'Code validated',
    },
  })
  forgotPasswordCode(@Body() data: ForgotPasswordcodeDto) {
    return this.authService.forgotPasswordCode(data.code)
  }

  @Post('user-validate/email')
  sendCodeToValidateEmail(@Body() { email }: { email: string }) {
    return this.authService.sendEmailConfirmationCode(email)
  }

  @Post('user-validate/email/code')
  receiveCodeToValidateEmail(
    @Body() { email, code }: { email: string; code: string },
  ) {
    return this.authService.receiveCodeToValidateEmail(email, code)
  }

  @Post('user-validate/code')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'Code validated',
    },
  })
  validateUserWithCode(@Body() data: ForgotPasswordcodeDto) {
    return this.authService.validateUserWithCode(data.code)
  }

  @Post('forgot-password/new-password')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'Password updated',
    },
  })
  forgotPasswordNewPassword(@Body() { password, code }: NewPasswordDto) {
    return this.authService.forgotPasswordChange(password, code)
  }
}
