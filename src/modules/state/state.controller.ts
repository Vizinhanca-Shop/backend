import { Controller, Get, Param } from '@nestjs/common'
import { StateService } from './state.service'

@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Get('list')
  async list() {
    return this.stateService.list()
  }

  @Get('cities/:stateId')
  async listStateCities(@Param('stateId') stateId: number) {
    return this.stateService.listStateCities(+stateId)
  }
}
