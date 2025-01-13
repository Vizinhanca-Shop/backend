type signInPropsType = {
  email: string
  password: string
}

type signInReturnType = {
  token: string
  refreshToken: string
}

type signUpType = {
  email: string
  password: string
  name: string
  roleId?: number
}

type signUpReturnType = {
  token: string
  refreshToken: string
}

type singPayload = {
  id?: number
  hash?: string
}

type signJwtReturnType = {
  token: string
  refreshToken: string
}

type verifyJwtReturnType = {
  id?: number
  email?: string
  name?: string
  iat: number
  exp: number
}
