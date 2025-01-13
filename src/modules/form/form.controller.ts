import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FormService } from './form.service'
import { ContactFormDto } from './dto/form.dto'

@Controller('form')
@ApiTags('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post('contact')
  createContact(@Body() data: ContactFormDto) {
    return this.formService.createContact(data)
  }
}
