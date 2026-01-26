import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/schemas/user.schema';
import { Otp } from './schemas/otp.schema';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendOtp(sendOtpDto: SendOtpDto) {
    const { phone, email, type } = sendOtpDto;

    // Generate OTP
    const otpCode = this.generateOtp();
    const expiresIn = parseInt(
      this.configService.get<string>('OTP_EXPIRES_IN') || '300000',
    );

    // Delete existing OTPs for this phone
    await this.otpModel.deleteMany({ phone, type });

    // Create new OTP
    const otp = await this.otpModel.create({
      phone,
      email,
      code: otpCode,
      type,
      expiresAt: new Date(Date.now() + expiresIn),
    });

    // Send OTP via SMS/Email (implement your SMS/Email service)
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${phone}: ${otpCode}`);
    } else {
      // await this.sendSMS(phone, otpCode);
      // if (email) await this.sendEmail(email, otpCode);
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { code: otpCode }),
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, code, type } = verifyOtpDto;

    // Find OTP
    const otp = await this.otpModel.findOne({
      phone,
      code,
      type,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Delete used OTP
    await this.otpModel.deleteOne({ _id: otp._id });

    // Find or create user
    let user = await this.userModel.findOne({ phone });

    if (!user) {
      // Create new user
      user = await this.userModel.create({
        phone,
        email: otp.email,
        isPhoneVerified: true,
        createdAt: new Date(),
      });
    } else {
      // Update verification status
      user.isPhoneVerified = true;
      if (otp.email) user.email = otp.email;
      await user.save();
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user._id.toString(),
      phone: user.phone,
    });

    return {
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        email: user.email,
        name: user.name,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }

  private generateOtp(): string {
    const length = parseInt(
      this.configService.get<string>('OTP_LENGTH') || '6',
    );
    return Math.floor(
      100000 + Math.random() * 900000,
    )
      .toString()
      .substring(0, length);
  }
}
