import { PrismaClient } from '@prisma/client'
import { fakeUsers } from './fake-data/users'
import { encrypt } from '../../src/utils/encrypt'

const prisma = new PrismaClient()

const users = async () => {
  console.log('Creating fake users')

  for (const fakeUser of fakeUsers) {
    const user = await prisma.user.upsert({
      where: { email: fakeUser.email },
      update: {},
      create: {
        email: fakeUser.email,
        person: {
          create: {
            ...fakeUser.person,
          },
        },
        role: fakeUser.role,
        password: await encrypt.hash(fakeUser.password),
      },
    })

    console.log('User created', user)
  }
}

const run = async () => {
  try {
    await users()
    console.log('Fake users created \n')
  } catch (error) {
    console.error(error)
  }
}

run()
