import { NestFactory } from '@nestjs/core'
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as bodyParser from 'body-parser'
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n'

import { AppModule } from './app.module'
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger'
import { WinstonModule } from 'nest-winston'
import { transports, format } from 'winston'
import { ValidationPipe, VersioningType } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    logger: WinstonModule.createLogger({
      transports: [
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.colorize(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`
            }),
          ),
        }),
      ],
    }),
  })

  const config = new DocumentBuilder()
    .setTitle('Mingoo API')
    .setDescription('Api for Mingoo application')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addServer('/v1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        'x-tokenName': 'access-token',
      },
      'access-token',
    )
    .build()

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  }

  const document = SwaggerModule.createDocument(app, config, options)
  SwaggerModule.setup('api/docs', app, document)
  app.enableCors()

  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('hbs')

  app.use(bodyParser.json({ limit: '100mb' }))
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
  app.useGlobalPipes(new ValidationPipe(), new I18nValidationPipe())
  app.useGlobalFilters(new I18nValidationExceptionFilter())

  await app.listen(process.env.API_PORT || 5000)
}

bootstrap()
