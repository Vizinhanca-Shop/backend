import {
  IsString,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { StateResponseDTO } from 'src/modules/state/dto/state.dto'
import { CityResponseDTO } from 'src/modules/state/dto/city.dto'

export class PersonDTO {
  @IsString()
  @ApiProperty({ example: 'John Doe' })
  name: string
}

export class CreatePersonDTO extends PersonDTO {}

export class UpdatePersonDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'John Doe', required: false })
  name?: string

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1, required: false })
  userId?: number
}

export class PersonResponseDTO {
  @IsNumber()
  @ApiProperty({ example: 1 })
  id: number

  @IsString()
  @ApiProperty({ example: 'John Doe' })
  name: string
}
