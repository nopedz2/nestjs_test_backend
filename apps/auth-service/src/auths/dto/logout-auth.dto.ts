import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutAuthDto {
  @IsNotEmpty({ message: 'Refresh token là bắt buộc' })
  @IsString({ message: 'Refresh token phải là chuỗi' })
  refresh_token: string;
}
