/**
 * POST /api/auth/send-otp
 * Send OTP code to user's phone/email
 */

import { NextRequest, NextResponse } from 'next/server';
// // import { createOTP, sendOTPSMS, sendOTPEmail } from '@/lib/utils/otp';
// // import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const sendOTPSchema = z.object({
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
  type: z.enum(['LOGIN', 'VERIFY_PHONE', 'RESET_PASSWORD']),
});

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  // For now, return a mock response for development
  try {
    const body = await request.json();
    const { phone, email, type } = sendOTPSchema.parse(body);

    // Mock OTP code for development
    const mockCode = '123456';

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (mock)',
      // In development, return mock code
      ...(process.env.NODE_ENV === 'development' && { code: mockCode }),
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

