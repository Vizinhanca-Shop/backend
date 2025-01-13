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
import {
  CreateAddressInfo,
  CreateReceiptMethodDto,
  CreateUserDto,
  UpdateAddressInfo,
} from './dto/create-user.dto'
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto'
import { RolesGuard } from 'src/guard/role.guard'
import { Roles } from 'src/custom/decorators/roles.decorator'
import { SearchUserDto } from './dto/search-user.dts'
import { AuthMiddlewareRequest } from 'src/types/type'
import { UserStatus } from '@prisma/client'

@ApiTags('user')
@Controller('user')
@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
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
          cellphone: '5548981726354',
          cadastur: '123456',
          cadasturAt: '2021-09-01T00:00:00.000Z',
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

  @Get('/guide-needs-approval')
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
  @Roles('admin')
  findGuideNeedsApproval(@Query() query: SearchUserDto) {
    return this.userService.findGuideNeedsApproval(query)
  }

  @Post('/change-status')
  @Roles('admin')
  @ApiResponse({
    status: 200,
  })
  changeUserStatus(@Body() data: { id: number; status: UserStatus }) {
    return this.userService.changeUserStatus(data.id, data.status)
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
  @Roles('admin', 'guide', 'user')
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
  profile(@Request() req) {
    return this.userService.findOneById(+req.user.id)
  }

  @Patch('/profile')
  @Roles('admin', 'guide', 'user')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.update(+req.user.id, updateUserDto, file)
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
  @Roles('admin', 'guide', 'user')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
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
          cellphone: '5548981726354',
          cadastur: '123456',
          cadasturAt: '2021-09-01T00:00:00.000Z',
          wantToBeCalled: 'User Name',
        },
      },
    },
  })
  update(
    @Query('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, file)
  }

  @Delete()
  @Roles('admin')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'User deleted successfully',
    },
  })
  remove(@Query('id') id: number) {
    return this.userService.remove(+id)
  }

  @Post('change-password')
  @Roles('admin', 'guide', 'user')
  @ApiResponse({
    status: 200,
    schema: {
      example: 'Password changed successfully',
    },
  })
  changePassword(@Request() req, @Body() data: ChangePasswordDto) {
    return this.userService.changePassword(req.user.id, data)
  }

  @Roles('admin', 'guide')
  @Post('receipt-method')
  createReceiptMethod(
    @Request() req: AuthMiddlewareRequest,
    @Body() data: CreateReceiptMethodDto,
  ) {
    return this.userService.createReceiptMethod(data, req)
  }

  @Put('receipt-method')
  editReceiptMethod(
    @Request() req: AuthMiddlewareRequest,
    @Body() data: CreateReceiptMethodDto,
  ) {
    return this.userService.editReceiptMethod(data, req)
  }

  @Roles('admin', 'guide')
  @Post('address-info')
  createAddressInfo(
    @Request() req: AuthMiddlewareRequest,
    @Body() data: CreateAddressInfo,
  ) {
    return this.userService.createAddressInfo(data, +req.user.id)
  }

  @Roles('admin', 'guide')
  @Put('address-info')
  editAddressInfo(
    @Request() req: AuthMiddlewareRequest,
    @Body() data: UpdateAddressInfo,
  ) {
    return this.userService.updateAddressInfo(data, +req.user.id)
  }
}
