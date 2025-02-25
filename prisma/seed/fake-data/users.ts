import { Role } from '@prisma/client'

export const fakeUsers = [
  {
    email: 'admin1@centerlight.com',
    password: 'Admin1@2025',
    role: Role.ADMIN,
    person: {
      name: 'Alice Johnson',
    },
  },
  {
    email: 'admin2@centerlight.com',
    password: 'Admin2@2025',
    role: Role.ADMIN,
    person: {
      name: 'Bob Smith',
    },
  },
  {
    email: 'manager1@centerlight.com',
    password: 'Manager1@2025',
    role: Role.MANAGER,
    person: {
      name: 'Charlie Davis',
    },
  },
  {
    email: 'manager2@centerlight.com',
    password: 'Manager2@2025',
    role: Role.MANAGER,
    person: {
      name: 'Diana Martinez',
    },
  },
  {
    email: 'user1@centerlight.com',
    password: 'User1@2025',
    role: Role.USER,
    person: {
      name: 'Evelyn Garcia',
    },
  },
  {
    email: 'user2@centerlight.com',
    password: 'User2@2025',
    role: Role.USER,
    person: {
      name: 'Frank Moore',
    },
  },
  {
    email: 'user3@centerlight.com',
    password: 'User3@2025',
    role: Role.USER,
    person: {
      name: 'Grace Lee',
    },
  },
  {
    email: 'user4@centerlight.com',
    password: 'User4@2025',
    role: Role.USER,
    person: {
      name: 'Henry Walker',
    },
  },
  {
    email: 'admin3@centerlight.com',
    password: 'Admin3@2025',
    role: Role.ADMIN,
    person: {
      name: 'Irene Young',
    },
  },
  {
    email: 'manager3@centerlight.com',
    password: 'Manager3@2025',
    role: Role.MANAGER,
    person: {
      name: 'Jack Harris',
    },
  },
  {
    email: 'user5@centerlight.com',
    password: 'User5@2025',
    role: Role.USER,
    person: {
      name: 'Karen White',
    },
  },
  {
    email: 'user6@centerlight.com',
    password: 'User6@2025',
    role: Role.USER,
    person: {
      name: 'Leo Hall',
    },
  },
  {
    email: 'admin4@centerlight.com',
    password: 'Admin4@2025',
    role: Role.ADMIN,
    person: {
      name: 'Mia Allen',
    },
  },
  {
    email: 'manager4@centerlight.com',
    password: 'Manager4@2025',
    role: Role.MANAGER,
    person: {
      name: 'Nathan Scott',
    },
  },
  {
    email: 'user7@centerlight.com',
    password: 'User7@2025',
    role: Role.USER,
    person: {
      name: 'Olivia Adams',
    },
  },
  {
    email: 'user8@centerlight.com',
    password: 'User8@2025',
    role: Role.USER,
    person: {
      name: 'Paul Carter',
    },
  },
  {
    email: 'admin5@centerlight.com',
    password: 'Admin5@2025',
    role: Role.ADMIN,
    person: {
      name: 'Quincy Perez',
    },
  },
  {
    email: 'manager5@centerlight.com',
    password: 'Manager5@2025',
    role: Role.MANAGER,
    person: {
      name: 'Rachel Edwards',
    },
  },
  {
    email: 'user9@centerlight.com',
    password: 'User9@2025',
    role: Role.USER,
    person: {
      name: 'Sam Wilson',
    },
  },
  {
    email: 'user10@centerlight.com',
    password: 'User10@2025',
    role: Role.USER,
    person: {
      name: 'Tina Brown',
    },
  },
]
