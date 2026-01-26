import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ASSIGNED = 'assigned',
  AT_STATION = 'at_station',
  COLLECTED = 'collected',
  ON_THE_WAY = 'on_the_way',
  ARRIVING = 'arriving',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  riderId?: string;

  @IsOptional()
  @IsString()
  estimatedDeliveryTime?: string;
}
