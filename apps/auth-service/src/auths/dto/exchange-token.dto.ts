import { IsNotEmpty } from 'class-validator';

export class ExchangeTokenDto {
  @IsNotEmpty()
  token: string;
}
