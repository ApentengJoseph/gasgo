/**
 * POST /api/auth/verify-otp
 * Verify OTP and authenticate user
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/utils/otp';
import { generateToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const verifyOTPSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, email, fullName } = verifyOTPSchema.parse(body);

    // Verify OTP
    const { valid, userId } = await verifyOTP(phone, code, 'LOGIN');

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          email: email || undefined,
          fullName: fullName || undefined,
          isVerified: true,
        },
      });
    } else {
      // Update user if email/name provided
      if (email || fullName) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(email && { email }),
            ...(fullName && { fullName }),
            isVerified: true,
          },
        });
      }
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      email: user.email || undefined,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
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

