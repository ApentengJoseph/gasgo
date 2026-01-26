import { IsString, IsEmail, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export enum OtpType {
  LOGIN = 'LOGIN',
  VERIFY_PHONE = 'VERIFY_PHONE',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export class SendOtpDto {
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(OtpType)
  type: OtpType;
}
