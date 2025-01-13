import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import * as crypto from 'crypto'
import PrismaClient from 'prisma/instance'
import { jwt as jwtUtil } from 'src/utils'

@Injectable()
export class AppleStrategy {
  constructor() {}

  async getUserInfo(accessToken: string) {
    try {
      const decoded = jwt.decode(accessToken, { complete: true })
      const response = await fetch('https://appleid.apple.com/auth/keys')
      if (!response.ok)
        throw new Error(
          `Could not contact apple endpoint for verifying keys at`,
        )
      const { keys } = await response.json()
      const key = keys.find((key) => key.kid === decoded.header.kid)

      if (!key) {
        throw new BadRequestException('Key not found')
      }

      const signingKey = crypto.createPublicKey({ key, format: 'jwk' })
      return jwt.verify(accessToken, signingKey, { algorithms: ['RS256'] })
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async validate(accessToken: string, headers: string): Promise<any> {
    try {
      const userInfo: any = await this.getUserInfo(accessToken)
      const hasUser = await PrismaClient.user.findFirst({
        where: { appleOauth: { id: userInfo.sub } },
      })

      if (!hasUser) {
        await PrismaClient.user.create({
          data: {
            email: userInfo.email,
            status: 'ACTIVED',
            appleOauth: {
              create: {
                id: userInfo.sub,
              },
            },
            role: {
              connect: { id: 3 },
            },
            person: { create: { name: 'username' } },
          },
        })
      }

      const appleUser = await PrismaClient.appleOauth.findUnique({
        where: { id: userInfo.sub },
      })

      if (!appleUser) {
        throw new BadRequestException('User id not found')
      }

      const user = await PrismaClient.user.findUnique({
        where: {
          id: appleUser.userId,
        },
        select: {
          id: true,
          email: true,
          status: true,
          password: true,
          avatarUrl: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          person: {
            select: {
              name: true,
              cellphone: true,
              birthdate: true,
              mother_name: true,
              nationality: true,
            },
          },
        },
      })

      if (headers && headers === 'centerlight-app') {
        if (user.role.id != 3) {
          throw new UnauthorizedException('User is not tourist')
        }
      }

      const payload = {
        id: user.id,
        email: user.email,
      }

      const tokens = await jwtUtil.sign(payload)
      return tokens
    } catch (error) {
      throw new BadRequestException(error)
    }
  }
}
