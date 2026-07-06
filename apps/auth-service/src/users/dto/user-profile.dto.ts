import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserProfileDto {
  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone?: string;

  @Expose()
  address?: string;

  @Expose()
  image?: string;
}
