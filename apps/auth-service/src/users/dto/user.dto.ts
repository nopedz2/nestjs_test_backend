import { Exclude, Expose, Transform } from 'class-transformer';
// import { IsEmail, IsOptional, IsString } from 'class-validator';

@Exclude()
export class UserDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString(), { toClassOnly: true })
  id?: string;

  @Expose()
  name?: string;

  @Expose()
  email: string;

  @Expose()
  phone?: string;

  @Expose()
  address?: string;

  @Expose()
  image?: string;
}
