import { NextResponse } from 'next/server';
import { getStations } from '@/lib/data/getStations';

export async function GET() {
  const { stations, live } = await getStations();
  return NextResponse.json({ stations, live }, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  });
}
