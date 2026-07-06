import { IsNotEmpty, IsEmail } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  // @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: 'Email không đúng định dạng' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
