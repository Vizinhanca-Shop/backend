const jwtExpEnv = process.env.JWT_EXPIRATION || '7d'
const jwtRefreshExpEnv = process.env.JWT_REFRESH_EXPIRATION || '30d'

export const jwtConstants = {
  jwtExpiration: jwtExpEnv,
  jwtRefreshExpiration: jwtRefreshExpEnv,
}
