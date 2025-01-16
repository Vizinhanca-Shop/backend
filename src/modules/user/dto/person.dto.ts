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

  @IsString()
  @ApiProperty({ example: '12345678901' })
  cpf: string

  @IsString()
  @ApiProperty({ example: '1234567890' })
  canac: string

  @IsDate()
  @ApiProperty({ example: '1990-01-01T00:00:00Z' })
  birthdate: Date

  @IsBoolean()
  @ApiProperty({ example: false })
  isPilot: boolean

  @IsNotEmpty()
  @ApiProperty({ type: StateResponseDTO, required: false })
  state: StateResponseDTO

  @IsNotEmpty()
  @ApiProperty({ type: CityResponseDTO, required: false })
  city: CityResponseDTO
}

export class CreatePersonDTO extends PersonDTO {}

export class UpdatePersonDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'John Doe', required: false })
  name?: string

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '1234567890', required: false })
  canac?: string

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '12345678901', required: false })
  cpf?: string

  @IsOptional()
  @IsDate()
  @ApiProperty({ example: '1990-01-01T00:00:00Z', required: false })
  birthdate?: Date

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false, required: false })
  isPilot?: boolean

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1, required: false })
  stateId?: number

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1, required: false })
  cityId?: number

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

  @IsString()
  @ApiProperty({ example: '1234567890' })
  canac: string

  @IsString()
  @ApiProperty({ example: '12345678901' })
  cpf: string

  @IsDate()
  @ApiProperty({ example: '1990-01-01T00:00:00Z' })
  birthdate: Date

  @IsBoolean()
  @ApiProperty({ example: false })
  isPilot: boolean

  @IsNumber()
  @ApiProperty({ example: 1 })
  stateId: number

  @IsNumber()
  @ApiProperty({ example: 1 })
  cityId: number
}
