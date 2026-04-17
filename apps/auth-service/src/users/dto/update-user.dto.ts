import { IsOptional, IsString, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string; 


  @IsNotEmpty({ message: 'Phone is required' })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  @MaxLength(255, { message: 'Address must not exceed 255 characters' })
  address: string;

  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  image?: string;
}
