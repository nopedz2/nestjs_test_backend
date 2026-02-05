import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsNotEmpty({ message: 'Phone is required' })
  phone?: string;

  @IsNotEmpty({ message: 'Phone is required' })
  address?: string;
  
  @IsOptional()
  image?: string;
  @IsOptional()
  isActive?: boolean;
  @IsOptional()
  codeId?: string;
  @IsOptional()
  codeExpire?: Date;
  @IsOptional()
  role?: string;
}
