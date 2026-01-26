import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  stationId?: string;

  @IsOptional()
  @IsString()
  riderId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
