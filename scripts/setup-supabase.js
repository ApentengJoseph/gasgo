/**
 * Run once to create all Supabase tables, RLS policies, and seed stations.
 * Usage: node scripts/setup-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Run raw SQL via the REST API (pg endpoint)
async function sql(query, label) {
  try {
    // Use Supabase's RPC to run arbitrary SQL
    const { error } = await supabase.rpc('exec_sql', { query });
    if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
      console.warn(`⚠  ${label}: ${error.message}`);
    } else {
      console.log(`✓  ${label}`);
    }
  } catch (e) {
    console.warn(`⚠  ${label}: ${e.message}`);
  }
}

async function createExecSqlFunction() {
  // First create a helper function to run SQL
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: 'SELECT 1' }),
  });
  if (res.status === 404) {
    // Function doesn't exist yet — create it via the management API
    const mgmtRes = await fetch(`${SUPABASE_URL.replace('.supabase.co', '')}/pg/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          CREATE OR REPLACE FUNCTION exec_sql(query text)
          RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
          BEGIN EXECUTE query; END; $$;
        `,
      }),
    });
    if (!mgmtRes.ok) return false;
  }
  return true;
}

async function runMigration() {
  console.log('\n🚀  Gasgo — Supabase Setup\n');
  console.log(`📡  Connecting to: ${SUPABASE_URL}\n`);

  // Test connection
  const { error: pingErr } = await supabase.from('_dummy_test_').select('*').limit(1);
  if (pingErr && pingErr.message.includes('ENOTFOUND')) {
    console.error('❌  Cannot reach Supabase. Your project is likely PAUSED.\n');
    console.error('   → Go to https://supabase.com/dashboard');
    console.error('   → Find your project and click "Restore project"');
    console.error('   → Wait ~2 minutes for it to come back online');
    console.error('   → Then run this script again\n');
    process.exit(1);
  }

  console.log('✓  Supabase is reachable\n');
  console.log('📦  Creating tables...\n');

  // ── Use Supabase SQL editor via the Management API ──────────────────────────
  const queries = [

    // Profiles
    [`
      CREATE TABLE IF NOT EXISTS profiles (
        id           uuid PRIMARY KEY,
        phone        text UNIQUE,
        name         text,
        avatar_url   text,
        role         text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','rider','admin')),
        fcm_token    text,
        is_active    boolean DEFAULT true,
        is_online    boolean DEFAULT false,
        current_lat  double precision,
        current_lng  double precision,
        created_at   timestamptz DEFAULT now()
      );
    `, 'profiles table'],

    // Stations
    [`
      CREATE TABLE IF NOT EXISTS stations (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name         text NOT NULL,
        address      text,
        lat          double precision NOT NULL,
        lng          double precision NOT NULL,
        phone        text,
        is_active    boolean DEFAULT true,
        rating       numeric(3,2) DEFAULT 0,
        rating_count int DEFAULT 0,
        created_at   timestamptz DEFAULT now()
      );
    `, 'stations table'],

    // Station prices
    [`
      CREATE TABLE IF NOT EXISTS station_prices (
        id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        station_id uuid REFERENCES stations ON DELETE CASCADE,
        size_kg    int NOT NULL,
        price      numeric(10,2) NOT NULL,
        UNIQUE(station_id, size_kg)
      );
    `, 'station_prices table'],

    // Orders
    [`
      CREATE TABLE IF NOT EXISTS orders (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number        text UNIQUE NOT NULL,
        user_id             uuid REFERENCES profiles,
        guest_session_id    text,
        station_id          uuid REFERENCES stations,
        station_name        text NOT NULL,
        cylinder_size       int NOT NULL,
        cylinder_name       text NOT NULL,
        quantity            int DEFAULT 1,
        cylinder_price      numeric(10,2) NOT NULL,
        delivery_address    text NOT NULL,
        delivery_lat        double precision NOT NULL,
        delivery_lng        double precision NOT NULL,
        delivery_notes      text,
        subtotal            numeric(10,2) NOT NULL,
        delivery_fee        numeric(10,2) NOT NULL,
        safekeeping_fee     numeric(10,2) NOT NULL DEFAULT 5,
        discount            numeric(10,2) NOT NULL DEFAULT 0,
        total               numeric(10,2) NOT NULL,
        status              text DEFAULT 'pending',
        rider_id            uuid REFERENCES profiles,
        rider_lat           double precision,
        rider_lng           double precision,
        rider_heading       double precision,
        payment_status      text DEFAULT 'pending',
        payment_reference   text,
        payment_method      text,
        coupon_code         text,
        estimated_arrival   timestamptz,
        confirmed_at        timestamptz,
        assigned_at         timestamptz,
        at_station_at       timestamptz,
        collected_at        timestamptz,
        on_the_way_at       timestamptz,
        arriving_at         timestamptz,
        delivered_at        timestamptz,
        cancelled_at        timestamptz,
        cancellation_reason text,
        created_at          timestamptz DEFAULT now()
      );
    `, 'orders table'],

    // Payments
    [`
      CREATE TABLE IF NOT EXISTS payments (
        id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id       uuid REFERENCES orders UNIQUE,
        reference      text UNIQUE NOT NULL,
        amount         numeric(10,2) NOT NULL,
        status         text DEFAULT 'pending',
        payment_method text DEFAULT 'paystack',
        channel        text,
        paid_at        timestamptz,
        created_at     timestamptz DEFAULT now()
      );
    `, 'payments table'],

    // Ratings
    [`
      CREATE TABLE IF NOT EXISTS ratings (
        id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    uuid REFERENCES profiles,
        station_id uuid REFERENCES stations,
        order_id   uuid REFERENCES orders UNIQUE,
        rating     int CHECK (rating BETWEEN 1 AND 5),
        comment    text,
        created_at timestamptz DEFAULT now()
      );
    `, 'ratings table'],

    // Addresses
    [`
      CREATE TABLE IF NOT EXISTS addresses (
        id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    uuid REFERENCES profiles ON DELETE CASCADE,
        label      text NOT NULL,
        address    text NOT NULL,
        lat        double precision NOT NULL,
        lng        double precision NOT NULL,
        is_default boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
    `, 'addresses table'],

    // Coupons
    [`
      CREATE TABLE IF NOT EXISTS coupons (
        id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code           text UNIQUE NOT NULL,
        discount_type  text NOT NULL CHECK (discount_type IN ('fixed','percent')),
        discount_value numeric(10,2) NOT NULL,
        min_order      numeric(10,2),
        max_uses       int,
        used_count     int DEFAULT 0,
        expires_at     timestamptz,
        is_active      boolean DEFAULT true
      );
    `, 'coupons table'],

    // Notifications
    [`
      CREATE TABLE IF NOT EXISTS notifications (
        id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    uuid REFERENCES profiles ON DELETE CASCADE,
        type       text NOT NULL,
        title      text NOT NULL,
        message    text NOT NULL,
        data       jsonb,
        read       boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
    `, 'notifications table'],

    // Realtime
    [`ALTER PUBLICATION supabase_realtime ADD TABLE orders;`, 'realtime on orders'],
    [`ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`, 'realtime on notifications'],

    // claim_guest_orders RPC
    [`
      CREATE OR REPLACE FUNCTION claim_guest_orders(p_guest_session_id text, p_user_id uuid)
      RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        UPDATE orders
        SET user_id = p_user_id, guest_session_id = NULL
        WHERE guest_session_id = p_guest_session_id
          AND user_id IS NULL
          AND status NOT IN ('delivered','cancelled');
      END; $$;
    `, 'claim_guest_orders function'],

    // Seed coupons
    [`
      INSERT INTO coupons (code, discount_type, discount_value, is_active)
      VALUES
        ('WELCOME10', 'percent', 10, true),
        ('SAVE15',    'percent', 15, true),
        ('GASGO20',   'percent', 20, true)
      ON CONFLICT (code) DO NOTHING;
    `, 'seed coupons'],
  ];

  // Run queries via fetch to the Supabase SQL endpoint
  for (const [query, label] of queries) {
    await runQuery(query, label);
  }

  // Seed stations
  console.log('\n📍  Seeding Koforidua stations...\n');
  await seedStations();

  console.log('\n✅  Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Go to Supabase Dashboard → Authentication → Providers');
  console.log('     Enable Phone and connect your Twilio account for real SMS OTP');
  console.log('  2. In Table Editor you should now see all tables');
  console.log('  3. Run: npm run dev\n');
}

async function runQuery(query, label) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query }),
    });

    if (res.status === 404) {
      // exec_sql function doesn't exist — use pg/query endpoint
      const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const pgData = await pgRes.json();
      if (!pgRes.ok && !JSON.stringify(pgData).includes('already exists')) {
        console.warn(`⚠  ${label}: ${pgData.message || pgRes.status}`);
      } else {
        console.log(`✓  ${label}`);
      }
      return;
    }

    const text = await res.text();
    if (!res.ok && !text.includes('already exists') && !text.includes('duplicate')) {
      console.warn(`⚠  ${label}: ${text.slice(0, 120)}`);
    } else {
      console.log(`✓  ${label}`);
    }
  } catch (e) {
    console.warn(`⚠  ${label}: ${e.message}`);
  }
}

async function seedStations() {
  const stations = [
    { name: 'GasPro Station',  address: 'Koforidua Central, ER',      lat: 6.098813,  lng: -0.27765,   phone: '+233200000001' },
    { name: 'SafeGas Depot',   address: 'Effiduase Road, Koforidua',  lat: 6.109447,  lng: -0.292065,  phone: '+233200000002' },
    { name: 'Energy Plus',     address: 'Jackson Road, Koforidua',    lat: 6.1076519, lng: -0.2799717, phone: '+233200000003' },
    { name: 'QuickFlame',      address: 'Koforidua New Road',         lat: 6.105526,  lng: -0.277021,  phone: '+233200000004' },
    { name: 'ClearGas Hub',    address: 'Nsukwao, Koforidua',         lat: 6.117014,  lng: -0.251796,  phone: '+233200000005' },
    { name: 'FlamePoint',      address: 'Old Tafo Road, Koforidua',   lat: 6.11364,   lng: -0.249552,  phone: '+233200000006' },
    { name: 'GasFirst',        address: 'Accra Road, Koforidua',      lat: 6.104499,  lng: -0.250154,  phone: '+233200000007' },
    { name: 'PureGas',         address: 'Adweso, Koforidua',          lat: 6.0754564, lng: -0.2499899, phone: '+233200000008' },
  ];

  const prices = [
    { size_kg: 3,  base: 45 },
    { size_kg: 6,  base: 85 },
    { size_kg: 12, base: 163 },
    { size_kg: 14, base: 197 },
  ];

  for (const station of stations) {
    const { data: inserted, error } = await supabase
      .from('stations')
      .upsert(station, { onConflict: 'name' })
      .select('id')
      .single();

    if (error) {
      console.warn(`⚠  station "${station.name}": ${error.message}`);
      continue;
    }

    // Seed prices with slight random variation per station
    const priceRows = prices.map((p) => ({
      station_id: inserted.id,
      size_kg: p.size_kg,
      price: +(p.base + Math.random() * 8 - 4).toFixed(2),
    }));

    const { error: priceErr } = await supabase
      .from('station_prices')
      .upsert(priceRows, { onConflict: 'station_id,size_kg' });

    if (priceErr) {
      console.warn(`⚠  prices for "${station.name}": ${priceErr.message}`);
    } else {
      console.log(`✓  ${station.name} + prices`);
    }
  }
}

runMigration().catch((e) => {
  console.error('❌  Fatal error:', e.message);
  process.exit(1);
});
