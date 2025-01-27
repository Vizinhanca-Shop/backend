import { Controller, Get, UseGuards } from '@nestjs/common'
import {
  SwaggerModule,
  DocumentBuilder,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { AppModule } from '../../app.module'
import { NestFactory } from '@nestjs/core'
import { RolesGuard } from 'src/guard/role.guard'
import { Roles } from 'src/custom/decorators/roles.decorator'

@ApiTags('schema')
@Controller('schema')
@ApiBearerAuth('access-token')
export class ExportController {
  @Get('collection')
  async getSwaggerJson() {
    const app = await NestFactory.create(AppModule)
    const config = new DocumentBuilder()
      .setTitle('Mingoo API ')
      .setDescription('Mingoo API description')
      .setVersion('1.0')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    await app.close()
    return document
  }
}
