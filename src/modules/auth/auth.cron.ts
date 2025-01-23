import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import prisma from 'prisma/instance'
import { sendEmail } from 'src/third_party/email'
import cmsTemplate from 'src/assets/templates/email/cms-forgot-password'
import appTemplate from 'src/assets/templates/email/app-forgot-password '
import { Role } from '@prisma/client'
@Injectable()
export class AuthCron {
  @Cron(CronExpression.EVERY_10_SECONDS)
  async sendRecoveryCodeEmail() {
    const codes = await prisma.userRecoveryCode.findMany({
      where: {
        sendAt: {
          equals: null,
        },
        retry: {
          lt: 5,
        },
      },
      select: {
        id: true,
        code: true,
        retry: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    })

    // for (const code of codes) {
    //   const isUserApp = code.user.role === Role.USER

    //   const template = isUserApp ? appTemplate : cmsTemplate
    //   const data = isUserApp
    //     ? code.code
    //     : process.env.FRONT_HOST + `/auth/new-password?code=${code.code}`

    //   const success = await sendEmail({
    //     to: code.user.email,
    //     subject: 'Centerlight - Recuperação de senha',
    //     text: template(String(data)),
    //   })

    //   await prisma.userRecoveryCode.update({
    //     where: {
    //       id: code.id,
    //     },
    //     data: {
    //       retry: code.retry + 1,
    //       ...(success && { sendAt: new Date() }),
    //     },
    //   })
    // }
  }
}
