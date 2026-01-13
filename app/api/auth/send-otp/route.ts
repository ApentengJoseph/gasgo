/**
 * POST /api/auth/send-otp
 * Send OTP code to user's phone/email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOTP, sendOTPSMS, sendOTPEmail } from '@/lib/utils/otp';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const sendOTPSchema = z.object({
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
  type: z.enum(['LOGIN', 'VERIFY_PHONE', 'RESET_PASSWORD']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, email, type } = sendOTPSchema.parse(body);

    // Check if user exists (for login/verify)
    let user = null;
    if (type === 'LOGIN' || type === 'VERIFY_PHONE') {
      user = await prisma.user.findUnique({
        where: { phone },
      });
    }

    // Generate and save OTP
    const code = await createOTP(phone, email || null, type, user?.id);

    // Send OTP via SMS
    await sendOTPSMS(phone, code);

    // Send OTP via Email if provided
    if (email) {
      await sendOTPEmail(email, code);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // In production, don't send code in response
      // For development/testing only:
      ...(process.env.NODE_ENV === 'development' && { code }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

