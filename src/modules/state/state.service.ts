import { Injectable } from '@nestjs/common'
import { State } from '@prisma/client'
import prisma from 'prisma/instance'
import { StateResponseDTO } from './dto/state.dto'
import { CityResponseDTO } from './dto/city.dto'

@Injectable()
export class StateService {
  async list(): Promise<StateResponseDTO[]> {
    return await prisma.state.findMany()
  }

  async listStateCities(stateId: number): Promise<CityResponseDTO[]> {
    return await prisma.city.findMany({
      where: {
        stateId,
      },
    })
  }
}
