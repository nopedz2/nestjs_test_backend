import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  // Matches,
} from 'class-validator';

@Exclude()
export class CreateUserDto {
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  // @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: 'Email không đúng định dạng' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @Expose()
  @IsOptional()
  phone?: string;

  @Expose()
  @IsOptional()
  address?: string;

  @Expose()
  @IsOptional()
  image?: string;

  @Expose()
  @IsOptional()
  isActive?: boolean;

  @Expose()
  @IsOptional()
  codeId?: string;

  @Expose()
  @IsOptional()
  codeExpire?: Date;

  @Expose()
  @IsOptional()
  role?: string;
}
