/**
 * POST /api/auth/verify-otp
 * Verify OTP and authenticate user
 */

import { NextRequest, NextResponse } from 'next/server';
// // import { verifyOTP } from '@/lib/utils/otp';
// // import { generateToken } from '@/lib/auth/jwt';
// // import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const verifyOTPSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  try {
    const body = await request.json();
    const { phone, code, email, fullName } = verifyOTPSchema.parse(body);

    // Mock verification for development
    // Accept any 6-digit code in development
    if (process.env.NODE_ENV === 'development' && code.length === 6) {
      return NextResponse.json({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          phone,
          email: email || null,
          fullName: fullName || null,
          role: 'CUSTOMER',
          isVerified: true,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid or expired OTP code' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

