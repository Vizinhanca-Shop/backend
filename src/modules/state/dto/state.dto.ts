import { IsString, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateStateDTO {
  @IsString()
  @ApiProperty({ example: 'Santa catarina' })
  name: string

  @IsString()
  @ApiProperty({ example: 'SC' })
  code: string
}

export class UpdateStateDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Santa Catarina', required: false })
  name?: string

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'SC', required: false })
  code?: string
}

export class StateResponseDTO {
  @IsNumber()
  @ApiProperty({ example: 1 })
  id: number

  @IsString()
  @ApiProperty({ example: 'Santa catarina' })
  name: string

  @IsString()
  @ApiProperty({ example: 'SC' })
  code: string
}
