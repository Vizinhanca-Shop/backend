import { IsString, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateStateDTO {
  @IsString()
  @ApiProperty({ example: 'California' })
  name: string

  @IsString()
  @ApiProperty({ example: 'CA' })
  code: string
}

export class UpdateStateDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'California', required: false })
  name?: string

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'CA', required: false })
  code?: string
}

export class StateResponseDTO {
  @IsNumber()
  @ApiProperty({ example: 1 })
  id: number

  @IsString()
  @ApiProperty({ example: 'California' })
  name: string

  @IsString()
  @ApiProperty({ example: 'CA' })
  code: string
}
