import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsEnum,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  stationId: string;

  @IsString()
  @IsEnum(['6kg', '12kg', '25kg'])
  cylinderSize: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  deliveryAddress: string;

  @IsNumber()
  deliveryLatitude: number;

  @IsNumber()
  deliveryLongitude: number;

  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @IsOptional()
  @IsString()
  addressId?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  guestSessionId?: string;
}
