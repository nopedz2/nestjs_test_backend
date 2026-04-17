import { IsNotEmpty } from "class-validator";

export class ForgotPasswordAuthDto {
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}