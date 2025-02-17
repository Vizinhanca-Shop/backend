import { Request } from 'express'
import { UserDTO } from 'src/modules/user/dto/user.dto'

interface AuthMiddlewareRequest extends Request {
  user: UserDTO
}
