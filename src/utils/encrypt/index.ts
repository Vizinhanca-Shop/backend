import * as bcrypt from 'bcryptjs'

export class encrypt {
  static async hash(password: string): Promise<string> {
    const encrypted = await bcrypt.hash(password, +process.env.HASH_SALT)
    return encrypted
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
  }
}
