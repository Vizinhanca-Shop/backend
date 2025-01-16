import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import Prisma from 'prisma'

@Injectable()
export class AuthCron {
  @Cron(CronExpression.EVERY_30_SECONDS)
  async sendRecoveryCodeEmail() {}
}
