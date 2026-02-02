import { IsString, IsNumber, IsMongoId, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  restaurant: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  image: string;

  @IsString()
  comment: string;
}