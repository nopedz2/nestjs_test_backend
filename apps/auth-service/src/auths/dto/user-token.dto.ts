import { IsNotEmpty, IsEmail } from 'class-validator';

export class UserTokenDto {
  @IsNotEmpty()
  tenantId: string;

  @IsNotEmpty()
  userId: string;

  @IsEmail()
  email: string;
}
