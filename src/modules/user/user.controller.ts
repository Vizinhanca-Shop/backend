import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  Request,
  UploadedFile,
  Put,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiResponse,
  ApiConsumes,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/user.dto'
import { ChangePasswordDto, UpdateUserDto, SearchUserDto } from './dto/user.dto'
import { RolesGuard } from 'src/guard/role.guard'
import { Roles } from 'src/custom/decorators/roles.decorator'
import { AuthMiddlewareRequest } from 'src/types/type'
import { diskStorage } from 'multer'

@ApiTags('user')
@Controller('user')
@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
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
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 1,
        name: 'User',
        email: 'user@centerlight.com.br',
        avatar: {
          id: 1,
          url: 'api.centerlight.com.br/avatar/j3kda4M2phÇoson4k5Y.png',
        },
        role: {
          id: 2,
          name: 'user',
        },
        person: {
          name: 'User',
        },
      },
    },
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: AuthMiddlewareRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.create(createUserDto, req.user.id, file)
  }

  @Get('/all')
  @Roles('admin')
  @ApiQuery({
    name: 'name',
    required: false,
    allowEmptyValue: true,
  })
  @ApiQuery({
    name: 'email',
    required: false,
    allowEmptyValue: true,
  })
  @ApiQuery({
    name: 'roleId',
    required: false,
    allowEmptyValue: true,
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 1,
          name: 'User',
          email: 'user@centerlight.com',
          role: {
            name: 'user',
            id: 2,
          },
        },
      ],
    },
  })
  findAll(
    @Query() query: SearchUserDto,
    @Request() req: AuthMiddlewareRequest,
  ) {
    const { limit = 10, page = 1 } = query
    return this.userService.findAll(query, req.user.id, +limit, +page)
  }

  @Get()
  @Roles('admin')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        email: 'user@centerlight.com.br',
        avatar: {
          id: 1,
          url: 'api.centerlight.com.br/avatar/j3kda4M2phÇoson4k5Y.png',
        },
        role: {
          id: 2,
          name: 'user',
        },
        person: {
          name: 'User',
          cellphone: '5548981726354',
          cadastur: '123456',
          cadasturAt: '2021-09-01T00:00:00.000Z',
        },
      },
    },
  })
  findOne(@Query('id') id: number) {
    return this.userService.findOneById(+id)
  }

  @Get('/profile')
  @Roles('admin', 'manager', 'user')
  profile(@Request() req) {
    return this.userService.findOneById(+req.user.id)
  }

  @Patch('/profile')
  @Roles('admin', 'manager', 'user')
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
  updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.update(req.user.id, updateUserDto, file)
  }

  @Get('/roles')
  @Roles('admin')
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 1,
          name: 'admin',
        },
        {
          id: 2,
          name: 'user',
        },
      ],
    },
  })
  roles() {
    return this.userService.findAllRoles()
  }

  @Patch()
  @Roles('admin', 'manager', 'user')
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
  update(
    @Query('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.update(+id, updateUserDto, file)
  }

  @Delete()
  @Roles('admin', 'manager', 'user')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'User deleted successfully',
    },
  })
  remove(@Request() req: AuthMiddlewareRequest, @Query('id') id?: number) {
    console.log(req.user)
    return this.userService.remove({ id, user: req.user })
  }

  @Post('change-password')
  @Roles('admin', 'manager', 'user')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'Password changed successfully',
    },
  })
  changePassword(@Request() req, @Body() data: ChangePasswordDto) {
    return this.userService.changePassword(req.user.id, data)
  }
}
