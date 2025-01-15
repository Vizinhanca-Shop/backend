import { PrismaClient, Role } from '@prisma/client'
import { encrypt } from '../../src/utils/encrypt'
import { brazilStates, defaultUsers } from './default'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv'
import { pipeline } from 'stream/promises'
const prisma = new PrismaClient()

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const createCsvPipeline = async (handleData, fileName) => {
  const parseOption = { delimiter: ',', from_line: 2 }
  const countryReadbleStream = fs.createReadStream(
    path.join(__dirname, fileName),
  )

  return await pipeline(countryReadbleStream, parse(parseOption), handleData)
}

const formatCountryData = (row, countryData) => {
  const headers = [
    'id',
    'country_name',
    'iso2',
    'iso3',
    'top_level_domain',
    'fips',
    'iso_numeric',
    'geonameid',
    'e164',
    'phone_code',
    'continent',
    'capital',
    'time_zone_in_capital',
    'currency',
    'language_codes',
    'languages',
    'area_km2',
    'internet_hosts',
    'internet_users',
    'phones_mobile',
    'phones_landline',
    'gdp',
  ]

  let countrieData = {}
  headers.forEach((header, index) => {
    countrieData = { ...countrieData, [header]: row[index] }
  })
  countryData.push(countrieData)
  return countryData
}

const formatCityData = (row, citiesData) => {
  const headers = [
    'id',
    'data_alteracao',
    'data_cadastro',
    'data_exclusao',
    'is_excluido',
    'ibge',
    'lat_lon',
    'nome',
    'usuario_alteracao_id',
    'usuario_excluiu_id',
    'uf',
    'algorix_id',
    'nome_sem_acento',
    'id_sub_regiao',
  ]

  let cityData = {}
  headers.forEach((header, index) => {
    cityData = { ...cityData, [header]: row[index] }
  })
  citiesData.push(cityData)
  return citiesData
}

const users = async () => {
  console.log('Creating admin and default user... \n')

  const adminUser = await prisma.user.upsert({
    where: { email: defaultUsers.admin.email },
    update: {},
    create: {
      email: defaultUsers.admin.email,
      person: {
        create: {
          ...defaultUsers.admin.person,
        },
      },
      role: Role.ADMIN,
      password: await encrypt.hash(defaultUsers.admin.password),
    },
  })

  const managerUser = await prisma.user.upsert({
    where: { email: defaultUsers.manager.email },
    update: {},
    create: {
      email: defaultUsers.manager.email,
      person: {
        create: {
          ...defaultUsers.manager.person,
        },
      },
      role: Role.MANAGER,
      password: await encrypt.hash(defaultUsers.manager.password),
    },
  })

  const appUser = await prisma.user.upsert({
    where: { email: defaultUsers.user.email },
    update: {},
    create: {
      email: defaultUsers.user.email,
      person: {
        create: {
          ...defaultUsers.user.person,
        },
      },
      role: Role.USER,
      password: await encrypt.hash(defaultUsers.user.password),
    },
  })

  console.log('Users created \n', { adminUser, managerUser, appUser })
}

const cities = async () => {
  const handleData = async (event) => {
    let citiesData = []

    await event.on('data', (row) => {
      citiesData = formatCityData(row, citiesData)
    })

    await event.on('end', async () => {
      const cities = citiesData.map(async (city) => {
        const data = {
          id: +city?.id,
          name: city?.nome || '',
          name_unaccent: removeAccents(city?.nome || ''),
          stateId: +city?.uf,
          latLong: city?.lat_lon || '',
        }

        return await prisma.city.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        })
      })

      const promissedCities = await Promise.all(cities)

      console.log(promissedCities)
    })
  }

  await createCsvPipeline(handleData, './csv/city_brazil.csv')
}

const removeData = async () => {
  await prisma.city.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  })
  await prisma.state.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  })
}

const runSeeds = async () => {
  try {
    await removeData()
    await prisma.state.createMany({ data: brazilStates })
    await cities()
    await users()
    console.log('Seeds executed successfully')
  } catch (error) {
    console.error(error)
  }
}

runSeeds()
