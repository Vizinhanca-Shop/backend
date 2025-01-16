import PrismaClient from 'prisma/instance'
export * from './encrypt'
export { default as jwt } from './jwt'
export * from './regex'

export const removeInvalidValues = (obj: Record<string, any>) =>
  Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(obj).filter(([_, v]) => !!v),
  )

export function generateRandomImageName(length: number = 32): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}

export function removeAccents(str) {
  return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : ''
}

export const distinctArray = (array: any[], key: string) => {
  const seen = new Set()
  return array.filter((item) => {
    const id = item[key]
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export const createRecoveryCode = async () => {
  const maxRetries = 10
  let retries = 0
  let code = null

  while (retries < maxRetries) {
    code = Math.floor(100000 + Math.random() * 900000)
    const exists = await PrismaClient.userRecoveryCode.findFirst({
      where: { code },
    })

    if (!exists) {
      return code
    }

    if (retries === maxRetries) {
      throw new Error('Could not generate a recovery code, max retries reached')
    }

    retries++
  }

  return code
}
