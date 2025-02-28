import {
  Controller,
  UploadedFile,
  Post,
  Body,
  Request,
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
  SignInCpfDto,
} from './dto/auth.dto'

import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { AuthMiddlewareRequest } from 'src/types/type'
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in/oauth')
  async oAuth(
    @Body() data: { token: string; type: 'GOOGLE' | 'APPLE' | 'FACEBOOK' },
    @Headers('x-request-origin') headers: string,
  ) {
    return await this.authService.signInWithOauth(data, headers)
  }

  @Post('sign-up')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/images/avatar',
        filename: (_, file, cb) => {
          const fileExtName = file.originalname.split('.').pop()
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('')
          cb(null, `${randomName}.${fileExtName}`)
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
        errors: [
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
  signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data)
  }

  @Post('sign-in-cpf')
  signInCpf(@Body() data: SignInCpfDto) {
    return this.authService.signInCpf(data)
  }

  @Post('sign-out')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'Sessão finalizada',
    },
  })
  signOut(@Request() req: AuthMiddlewareRequest) {
    if (!req.user) {
      throw new BadRequestException({
        message: 'Falha na validação',
        errors: [
          {
            field: 'token',
            message: 'Token inválido',
          },
        ],
      })
    }

    return this.authService.signOut(req.user.id)
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
      example: 'E-mail enviado',
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: 'Falha na validação',
        errors: [
          {
            field: 'email',
            message: 'E-mail inválido',
          },
        ],
      },
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
