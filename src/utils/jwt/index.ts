import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { jwtConstants } from 'src/const/jwt'

const generateRefreshToken = (payload: singPayload): string => {
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: jwtConstants.jwtRefreshExpiration,
  })

  if (!token) {
    throw new BadRequestException('Error signing refresh token')
  }

  return token
}

const generateToken = (payload: singPayload): string => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: jwtConstants.jwtExpiration,
    })

    return token
  } catch (error) {
    throw new BadRequestException('Error signing token')
  }
}

const sign = async (payload: singPayload): Promise<signJwtReturnType> => {
  const token = generateToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return {
    token,
    refreshToken,
  }
}

const verify = (token: string): verifyJwtReturnType => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as verifyJwtReturnType
  } catch (error) {
    throw new UnauthorizedException('Invalid token')
  }
}

const verifyRefreshToken = (token: string): verifyJwtReturnType => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET,
    ) as verifyJwtReturnType
  } catch (error) {
    throw new BadRequestException('Invalid refresh token')
  }
}

export default {
  sign,
  verify,
  generateToken,
  verifyRefreshToken,
}
