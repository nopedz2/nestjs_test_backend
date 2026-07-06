import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export enum SortField {
  NAME = 'name',
  EMAIL = 'email',
  CREATED = 'createdAt',
  UPDATED = 'updatedAt',
  ROLE = 'role',
  IS_ACTIVE = 'isActive',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

@ValidatorConstraint({ async: false })
export class UniqueSortFieldsConstraint implements ValidatorConstraintInterface {
  validate(value: SortItemDto[], args: ValidationArguments) {
    if (!value || !Array.isArray(value)) return true;

    const fields = value.map((item) => item.field);
    const uniqueFields = new Set(fields);
    return fields.length === uniqueFields.size;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Sort fields must be unique - cannot sort by the same field multiple times';
  }
}

export function IsUniqueSortFields(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    Validate(UniqueSortFieldsConstraint, validationOptions)(
      object,
      propertyName,
    );
  };
}

export class SortItemDto {
  @IsEnum(SortField, {
    message:
      'sort field must be one of name, email, createdAt, updatedAt, role, isActive',
  })
  field: SortField;

  @IsEnum(SortOrder, {
    message: 'sort order must be asc or desc',
  })
  order: SortOrder;
}

export class FindUsersQueryDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'current must be an integer' })
  @Min(1, { message: 'current must be at least 1' })
  current: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize must be an integer' })
  @Min(1, { message: 'pageSize must be at least 1' })
  @Max(100, { message: 'pageSize must be at most 100' })
  pageSize: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortItemDto)
  @IsUniqueSortFields()
  sort: SortItemDto[];
}
