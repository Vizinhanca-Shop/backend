import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import PrismaClient from 'prisma/instance'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: any) {
    const [model, field] = args.constraints as string[]

    const count = await PrismaClient[model].count({
      where: {
        [field]: value,
      },
    })
    return count === 0
  }

  defaultMessage(args: any) {
    const [model, field] = args.constraints
    return `${field} already exists in ${model}`
  }
}

export function IsUnique(
  model: string,
  field: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [model, field],
      validator: IsUniqueConstraint,
    })
  }
}
