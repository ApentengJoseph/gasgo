import { IsString, IsEmail, IsNumber, Min } from 'class-validator';

export class InitializePaymentDto {
  @IsString()
  orderId: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
