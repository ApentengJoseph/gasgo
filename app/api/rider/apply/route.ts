import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { fail, rateLimited, clientIp, sameOrigin, clean, isGhanaPhone, normalisePhone } from '@/lib/server/guard';

/**
 * POST /api/rider/apply — someone applies to ride for GasRefill.
 * Creates their login (email + password) and a PENDING rider profile.
 * They can sign in to see their status, but can't take jobs until an admin approves.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  if (rateLimited(`rider-apply:${clientIp(req)}`, 5, 60 * 60 * 1000)) return fail(429, 'Too many applications from this connection. Please try later.');
  const b = await req.json().catch(() => ({}));
  const name = clean(b.name, 80), email = clean(b.email, 120).toLowerCase(), password = typeof b.password === 'string' ? b.password : '';
  const phone = clean(b.phone, 20), vehicleType = b.vehicleType, vehicleReg = clean(b.vehicleReg, 20).toUpperCase();
  const momoNumber = clean(b.momoNumber, 20), momoNetwork = b.momoNetwork;

  if (name.length < 3) return fail(400, 'Enter your full name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, 'Enter a valid email.');
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return fail(400, 'Use a password of at least 8 characters with letters and numbers.');
  if (!isGhanaPhone(phone)) return fail(400, 'Enter a valid Ghana phone number.');
  if (!['motorbike', 'tricycle'].includes(vehicleType)) return fail(400, 'Choose your vehicle.');
  if (vehicleReg.length < 4) return fail(400, 'Enter your vehicle registration number.');
  if (!isGhanaPhone(momoNumber)) return fail(400, 'Enter the MoMo number for your payouts.');
  if (!['MTN', 'TELECEL', 'AIRTELTIGO'].includes(momoNetwork)) return fail(400, 'Choose your MoMo network.');

  const admin = createServiceRoleClient();
  const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !created.user) {
    // Same message either way, so nobody can use this form to check which emails have accounts.
    return fail(400, 'We couldn’t create an account with this email. If you already applied, sign in instead.');
  }
  const id = created.user.id;
  const { error: pErr } = await admin.from('profiles').upsert({ id, name, phone: normalisePhone(phone), role: 'rider', is_active: true, is_online: false }, { onConflict: 'id' });
  const { error: rErr } = await admin.from('riders').insert({
    id, status: 'pending', vehicle_type: vehicleType, vehicle_reg: vehicleReg,
    licence_no: clean(b.licenceNo, 30) || null, ghana_card_no: clean(b.ghanaCardNo, 30).toUpperCase() || null,
    momo_number: normalisePhone(momoNumber), momo_network: momoNetwork, emergency_contact: clean(b.emergencyContact, 40) || null,
  });
  if (pErr || rErr) {
    await admin.auth.admin.deleteUser(id); // don't leave half-made accounts
    return fail(500, 'Could not save your application. Please try again.');
  }
  return NextResponse.json({ ok: true });
}
