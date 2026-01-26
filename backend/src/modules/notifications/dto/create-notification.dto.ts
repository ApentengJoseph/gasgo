import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  ORDER = 'order',
  PAYMENT = 'payment',
  DELIVERY = 'delivery',
  SYSTEM = 'system',
}

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  link?: string;
}
