import {
  NestMiddleware,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { jwt } from 'src/utils'
import PrismaClient from 'prisma/instance'
import { Role } from '@prisma/client'

interface AuthMiddlewareRequest extends Request {
  user: {
    id: number
    role: Role
    email: string
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: AuthMiddlewareRequest, next: (value?: unknown) => void) {
    const bearerHeader = req.headers.authorization
    const accessToken = bearerHeader?.split(' ')[1]
    const token = accessToken ?? bearerHeader

    if (!token) {
      //TODO: Implement a better way to handle this to access public routes
      return next()
    }

    const info = jwt.verify(token)

    const userAuth = await PrismaClient.user.findUnique({
      select: {
        id: true,
        role: true,
        email: true,
      },
      where: {
        id: info.id,
      },
    })

    if (!userAuth) {
      return next(new UnauthorizedException('Invalid token'))
    }

    req.user = userAuth

    next()
  }
}
