import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import PrismaClient from 'prisma/instance'
import { jwt as jwtUtil } from 'src/utils'
import axios from 'axios';

@Injectable()
export class GoogleStrategy {
  async getUserInfo(accessToken: string) {
    try {
      const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.data) {
        throw new BadRequestException("Error on signin with google")
      }

      return response.data
    } catch (error) {
      throw new BadRequestException(error?.response?.data?.error_description || error)
    }
  }

  async validate(accessToken: string, headers: string): Promise<any> {
    try {
      const userInfo = await this.getUserInfo(accessToken);
      const hasUser = await PrismaClient.user.findFirst({ where: { email: userInfo.email } })

      if (!hasUser) {
        await PrismaClient.user.create({
          data: {
            email: userInfo.email,
            role: "USER",
            person: { create: { name: userInfo.name } }
          }
        })
      }

      const user = await PrismaClient.user.findUnique({
        where: {
          email: userInfo.email,
        },
        select: {
          id: true,
          email: true,
          status: true,
          password: true,
          avatarUrl: true,
          role: true,
          person: {
            select: {
              name: true,
            },
          },
        },
      })

      if (headers) {
        if (user.role === "USER") {
          throw new UnauthorizedException("Role is not valid")
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
