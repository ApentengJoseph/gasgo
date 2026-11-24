import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Saved delivery addresses for the signed-in user (guest sessions included).
 * Uses the user's own session, so database row-level security limits every
 * query to that user's rows.
 */
async function session() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await session();
  if (!user) return NextResponse.json({ addresses: [] });
  const { data, error } = await supabase
    .from('addresses').select('*').eq('user_id', user.id)
    .order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ addresses: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await session();
  if (!user) return NextResponse.json({ error: 'Your session expired. Please refresh.' }, { status: 401 });
  const { label, address, lat, lng, is_default } = await request.json();
  if (!address || lat == null || lng == null) {
    return NextResponse.json({ error: 'Address and map location are required.' }, { status: 400 });
  }
  const { count } = await supabase.from('addresses').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const makeDefault = !!is_default || !count;
  if (makeDefault) await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  const { data, error } = await supabase
    .from('addresses')
    .insert({ user_id: user.id, label: label || 'Home', address, lat, lng, is_default: makeDefault })
    .select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ address: data });
}

export async function PATCH(request: NextRequest) {
  const { supabase, user } = await session();
  if (!user) return NextResponse.json({ error: 'Your session expired. Please refresh.' }, { status: 401 });
  const { addressId } = await request.json();
  if (!addressId) return NextResponse.json({ error: 'addressId required' }, { status: 400 });
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  await supabase.from('addresses').update({ is_default: true }).eq('id', addressId).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await session();
  if (!user) return NextResponse.json({ error: 'Your session expired. Please refresh.' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
