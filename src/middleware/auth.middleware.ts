import {
  NestMiddleware,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { jwt } from 'src/utils'
import PrismaClient from 'prisma/instance'

interface AuthMiddlewareRequest extends Request {
  user: {
    id: number
    roleId: number
    email: string
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(
    req: AuthMiddlewareRequest,
    res: Response,
    next: (value?: unknown) => void,
  ) {
    if (req.headers.authorization?.includes('Basic')) {
      const credentials = Buffer.from(
        req.headers.authorization.split(' ')[1],
        'base64',
      ).toString()
      if (!credentials) return next(new UnauthorizedException('Invalid token'))

      const accessToken = credentials.split(':').at(1)

      if (!accessToken) return next(new UnauthorizedException('Invalid token'))

      const hasToken = await PrismaClient.integrations.findFirst({
        where: { jwt: accessToken },
      })
      if (!hasToken?.id) return next(new UnauthorizedException('Invalid token'))

      return next()
    }

    const bearerHeader = req.headers.authorization
    const accessToken = bearerHeader?.split(' ')[1]
    const token = accessToken ?? bearerHeader
    if (!token && req.originalUrl.includes('auth')) return next()

    if (!token) {
      //TODO: Implement a better way to handle this to access public routes
      return next()
    }

    const info = jwt.verify(token)

    const userAuth = await PrismaClient.user.findUnique({
      select: {
        id: true,
        roleId: true,
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
