import { ScheduleModule } from '@nestjs/schedule'
import {
  Module,
  MiddlewareConsumer,
  ValidationPipe,
  BadRequestException,
  RequestMethod,
} from '@nestjs/common'
import {
  I18nModule,
  I18nContext,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
  I18nService,
} from 'nestjs-i18n'
import { APP_PIPE, APP_GUARD } from '@nestjs/core'
import { join } from 'path'

import { AppController } from './app.controller'
import { ExportController } from './modules/schema/schema.controller'

import { AppService } from './app.service'

import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { FormModule } from './modules/form/form.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware'
import { AuthMiddleware } from './middleware/auth.middleware'
import { RolesGuard } from './guard/role.guard'
@Module({
  imports: [
    UserModule,
    AuthModule,
    FormModule,
    ScheduleModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      fallbacks: {
        'pt-BR': 'pt',
        'en-*': 'en',
        'es-*': 'es',
      },
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      typesOutputPath: join(__dirname, '../src/i18n/generated/i18n.types.ts'),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AppController, ExportController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: (i18n: I18nService) =>
        new ValidationPipe({
          exceptionFactory: (errors) => {
            i18n.resolveLanguage = () => I18nContext.current().lang

            const errorsMessages = errors.map((error) => {
              const constraints = error.constraints
              const firstKey = Object.keys(constraints)[0]
              let message = constraints[firstKey]

              if (firstKey === 'IsUniqueConstraint') {
                message = i18n.t(`unique.${error.property}`)
              } else {
                message = i18n.t(`validation.${firstKey}`)
              }

              if (message.includes('validation')) {
                message = constraints[firstKey]
              }

              return {
                field: error.property,
                message: message,
              }
            })

            return new BadRequestException({
              message: i18n.t('validation.failed'),
              errors: errorsMessages,
            })
          },
        }),
      inject: [I18nService],
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*')
      .apply(AuthMiddleware)
      .exclude({ path: '/images/(.*)', method: RequestMethod.GET })
      .forRoutes('*')
  }
}
