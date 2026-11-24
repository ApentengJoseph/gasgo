import { NextResponse } from 'next/server';

// Phone OTP sign-in was retired: it never sent real SMS, and in development it
// accepted any code for any number. Customers now order as guests (anonymous
// Supabase sessions); saved accounts, riders and admins sign in with email.
export async function POST() {
  return NextResponse.json({ error: 'Phone sign-in is no longer available.' }, { status: 410 });
}
