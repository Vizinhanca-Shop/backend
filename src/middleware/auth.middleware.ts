import {
  NestMiddleware,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { jwt } from 'src/utils'
import prisma from 'prisma/instance'
import { Role } from '@prisma/client'

interface AuthMiddlewareRequest extends Request {
  user: {
    id: number
    role: Role
    email: string
  }
}

const publicRoutes = ['auth', 'public', 'state']
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: AuthMiddlewareRequest, next: (value?: unknown) => void) {
    const bearerHeader = req.headers.authorization
    const accessToken = bearerHeader?.split(' ')[1]
    const token = accessToken ?? bearerHeader

    const isPublicRoute = publicRoutes.some((route) =>
      req.originalUrl.includes(route),
    )

    if (isPublicRoute) {
      return req.next()
    }

    if (!token) {
      return req.next(new UnauthorizedException('Token not provided'))
    }

    const info = jwt.verify(token)

    const userAuth = await prisma.user.findUnique({
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
      return req.next(new UnauthorizedException('Invalid token'))
    }

    req.user = userAuth

    req.next()
  }
}
