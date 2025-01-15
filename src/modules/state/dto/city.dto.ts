import { IsString, IsNumber, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCityDTO {
  @IsString()
  @ApiProperty({ example: 'Los Angeles' })
  name: string

  @IsString()
  @ApiProperty({ example: '34.0522,-118.2437' })
  latLong: string

  @IsNumber()
  @ApiProperty({ example: 1 })
  stateId: number
}

export class UpdateCityDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Los Angeles', required: false })
  name?: string

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '34.0522,-118.2437', required: false })
  latLong?: string

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1, required: false })
  stateId?: number
}

export class CityResponseDTO {
  @IsNumber()
  @ApiProperty({ example: 1 })
  id: number

  @IsString()
  @ApiProperty({ example: 'Los Angeles' })
  name: string
}
