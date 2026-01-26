import { IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { OtpType } from './send-otp.dto';

export class VerifyOtpDto {
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @IsString()
  @MinLength(4)
  @MaxLength(8)
  code: string;

  @IsEnum(OtpType)
  type: OtpType;
}
