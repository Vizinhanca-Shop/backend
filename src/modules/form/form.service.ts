import { Injectable } from '@nestjs/common'
import { ContactFormDto } from './dto/form.dto'

@Injectable()
export class FormService {
  constructor() {}

  async createContact(data: ContactFormDto) {
    console.log(data)
    try {
      // await this.sendgrid.sendEmail({
      //   contactForm: data,
      //   to: 'contato@centerlight.com.br',
      //   title: `${data.name} entrou em contato`,
      //   subject: `${data.name} entrou em contato`,
      //   html: data.message,
      // })
    } catch (error) {
      console.error(error)
      throw new Error('Não foi possível enviar o e-mail')
    }
  }
}
