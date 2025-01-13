import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import PrismaClient from 'prisma/instance'
import { jwt } from 'src/utils'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const bearerHeader = request.headers.authorization
    const accessToken = bearerHeader?.split(' ')[1]
    const token = accessToken ?? bearerHeader

    if (!token) {
      return false
    }

    const decoded = jwt.verify(token)
    const user = await PrismaClient.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    })

    return requiredRoles.includes(user.role.name)
  }
}
