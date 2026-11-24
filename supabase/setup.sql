-- ============================================================
-- GASGO — Run this ONCE in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────

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

CREATE TABLE IF NOT EXISTS station_prices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES stations ON DELETE CASCADE,
  size_kg    int NOT NULL,
  price      numeric(10,2) NOT NULL,
  UNIQUE(station_id, size_kg)
);

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

CREATE TABLE IF NOT EXISTS ratings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles,
  station_id uuid REFERENCES stations,
  order_id   uuid REFERENCES orders UNIQUE,
  rating     int CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz DEFAULT now()
);

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

-- ── Realtime ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ── Auto-create profile when a user signs up ─────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, phone)
  VALUES (NEW.id, NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Claim guest orders after login ───────────────────────────
CREATE OR REPLACE FUNCTION claim_guest_orders(p_guest_session_id text, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE orders
  SET user_id = p_user_id, guest_session_id = NULL
  WHERE guest_session_id = p_guest_session_id
    AND user_id IS NULL
    AND status NOT IN ('delivered','cancelled');
END; $$;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Stations public read
CREATE POLICY "stations_public_read" ON stations FOR SELECT USING (true);
CREATE POLICY "station_prices_public_read" ON station_prices FOR SELECT USING (true);

-- Profiles: own row
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Orders: customer sees own; anyone can insert (guest checkout)
CREATE POLICY "orders_customer_read" ON orders FOR SELECT
  USING (auth.uid() = user_id OR guest_session_id IS NOT NULL);
CREATE POLICY "orders_insert_any" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_rider_update" ON orders FOR UPDATE
  USING (auth.uid() = rider_id OR
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "orders_admin_all" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "orders_rider_read" ON orders FOR SELECT
  USING (auth.uid() = rider_id OR
         (status = 'confirmed' AND rider_id IS NULL AND
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'rider')));

-- Addresses: own
CREATE POLICY "addresses_own" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Ratings: insert own; read all
CREATE POLICY "ratings_insert_own" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_read_all"   ON ratings FOR SELECT USING (true);

-- Notifications: own
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Payments: via order ownership
CREATE POLICY "payments_own" ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
  ));

-- ── Seed: 8 Koforidua stations ────────────────────────────────
INSERT INTO stations (name, address, lat, lng, phone) VALUES
  ('GasPro Station',  'Koforidua Central, ER',      6.098813,  -0.27765,   '+233200000001'),
  ('SafeGas Depot',   'Effiduase Road, Koforidua',  6.109447,  -0.292065,  '+233200000002'),
  ('Energy Plus',     'Jackson Road, Koforidua',    6.1076519, -0.2799717, '+233200000003'),
  ('QuickFlame',      'Koforidua New Road',          6.105526,  -0.277021,  '+233200000004'),
  ('ClearGas Hub',    'Nsukwao, Koforidua',          6.117014,  -0.251796,  '+233200000005'),
  ('FlamePoint',      'Old Tafo Road, Koforidua',    6.11364,   -0.249552,  '+233200000006'),
  ('GasFirst',        'Accra Road, Koforidua',       6.104499,  -0.250154,  '+233200000007'),
  ('PureGas',         'Adweso, Koforidua',           6.0754564, -0.2499899, '+233200000008')
ON CONFLICT DO NOTHING;

-- Seed prices for each station
INSERT INTO station_prices (station_id, size_kg, price)
SELECT id, 3,  45.00 FROM stations ON CONFLICT DO NOTHING;
INSERT INTO station_prices (station_id, size_kg, price)
SELECT id, 6,  85.00 FROM stations ON CONFLICT DO NOTHING;
INSERT INTO station_prices (station_id, size_kg, price)
SELECT id, 12, 163.00 FROM stations ON CONFLICT DO NOTHING;
INSERT INTO station_prices (station_id, size_kg, price)
SELECT id, 14, 197.00 FROM stations ON CONFLICT DO NOTHING;

-- Seed coupons
INSERT INTO coupons (code, discount_type, discount_value) VALUES
  ('WELCOME10', 'percent', 10),
  ('SAVE15',    'percent', 15),
  ('GASGO20',   'percent', 20)
ON CONFLICT (code) DO NOTHING;

SELECT 'Setup complete ✓' AS result;
