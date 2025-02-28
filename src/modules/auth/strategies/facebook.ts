import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import PrismaClient from 'prisma/instance'
import { jwt as jwtUtil } from 'src/utils'


@Injectable()
export class FacebookStrategy {
  async getUserInfo(accessToken: string) {
    try {
      const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;

      const response = await axios.get(url, {
        params: {
          access_token: accessToken
        }
      });
      
      if (!response.data) {
        throw new BadRequestException("Error on signin with facebook")
      }
  
      return response.data
    } catch (error) {
      throw new BadRequestException(error?.response?.data?.error?.message || error)
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
        if (user.role != "USER") {
          throw new UnauthorizedException("Invalid user role")
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