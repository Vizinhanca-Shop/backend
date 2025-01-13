import { Request } from 'express'

interface AuthMiddlewareRequest extends Request {
  user: {
    id: number
    roleId: number
    email: string
  }
}
