-- ============================================================
-- 003 — Rider app, admin, wallet, support, analytics, device linking
-- Run once in Supabase → SQL Editor (after 002). Safe to re-run.
--
-- Security model: customers and riders never write orders directly any more.
-- Every change goes through server routes that check the user, the role and
-- the allowed status transition, then write with the service role.
-- ============================================================

-- ── Orders: new fields ────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_by        text;          -- 'customer' | 'admin' | 'system'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_earning       numeric(10,2); -- set when the rider accepts
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee        numeric(10,2); -- GasRefill's share of fees
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cash_collected_at   timestamptz;   -- cash orders: paid at pickup
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refill_photo_path   text;          -- optional photo of the full cylinder
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status       text;          -- null | 'pending' | 'refunded' | 'failed'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS station_settled_at  timestamptz;   -- MoMo orders: station paid by GasRefill

-- ── Riders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riders (
  id               uuid PRIMARY KEY REFERENCES profiles ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','suspended')),
  vehicle_type     text NOT NULL CHECK (vehicle_type IN ('motorbike','tricycle')),
  vehicle_reg      text NOT NULL,
  licence_no       text,
  ghana_card_no    text,
  momo_number      text NOT NULL,
  momo_network     text NOT NULL CHECK (momo_network IN ('MTN','TELECEL','AIRTELTIGO')),
  emergency_contact text,
  rejection_reason text,
  approved_at      timestamptz,
  approved_by      uuid REFERENCES profiles,
  created_at       timestamptz DEFAULT now()
);

-- Orders a rider declined (so the same request isn't shown to them again)
CREATE TABLE IF NOT EXISTS order_declines (
  order_id   uuid REFERENCES orders ON DELETE CASCADE,
  rider_id   uuid REFERENCES profiles ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (order_id, rider_id)
);

-- ── Wallet: every money movement for a rider is one ledger line ──
-- Balance = SUM(amount). Positive = GasRefill owes the rider; negative = rider owes GasRefill.
CREATE TABLE IF NOT EXISTS rider_ledger (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id   uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  order_id   uuid REFERENCES orders ON DELETE SET NULL,
  type       text NOT NULL CHECK (type IN ('earning','cash_kept','withdrawal','withdrawal_reversal','adjustment')),
  amount     numeric(10,2) NOT NULL,
  note       text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (order_id, type)          -- an order can't be credited twice
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id       uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  amount         numeric(10,2) NOT NULL CHECK (amount > 0),
  momo_number    text NOT NULL,
  momo_network   text NOT NULL,
  status         text NOT NULL DEFAULT 'requested'
                 CHECK (status IN ('requested','processing','paid','failed','rejected')),
  reference      text UNIQUE NOT NULL,
  transfer_code  text,
  failure_reason text,
  processed_by   uuid REFERENCES profiles,
  processed_at   timestamptz,
  created_at     timestamptz DEFAULT now()
);
-- Only one open withdrawal per rider at a time
CREATE UNIQUE INDEX IF NOT EXISTS withdrawals_one_open
  ON withdrawals (rider_id) WHERE status IN ('requested','processing');

-- ── Customer questions (from the FAQ form) ─────────────────────
CREATE TABLE IF NOT EXISTS support_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles ON DELETE SET NULL,
  name        text,
  contact     text,
  question    text NOT NULL,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','closed')),
  answer      text,
  answered_by uuid REFERENCES profiles,
  answered_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- ── Product analytics (no personal data) ──────────────────────
CREATE TABLE IF NOT EXISTS app_events (
  id         bigserial PRIMARY KEY,
  user_id    uuid,
  session_id text NOT NULL,
  event      text NOT NULL,     -- 'session_start' | 'page_view' | 'heartbeat' | 'checkout_start' | 'order_placed' …
  path       text,
  device     text,              -- 'mobile' | 'desktop'
  meta       jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS app_events_created_idx ON app_events (created_at);
CREATE INDEX IF NOT EXISTS app_events_session_idx ON app_events (session_id);

-- ── Link this account to another device (short-lived one-time codes) ──
CREATE TABLE IF NOT EXISTS link_codes (
  code_hash  text PRIMARY KEY,   -- sha256 of the code; the code itself is never stored
  user_id    uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  attempts   int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ── Late or duplicate MoMo payments (approved after a retry, cash switch or cancel) ──
-- One row per Paystack reference so each is applied or refunded exactly once.
CREATE TABLE IF NOT EXISTS payment_events (
  reference  text PRIMARY KEY,
  order_id   uuid REFERENCES orders ON DELETE SET NULL,
  outcome    text NOT NULL,   -- 'late' → 'applied' | 'refunded' | 'refund_failed'
  created_at timestamptz DEFAULT now()
);

-- ── Admin audit trail: every admin action, who did it and when ──
CREATE TABLE IF NOT EXISTS admin_audit (
  id         bigserial PRIMARY KEY,
  admin_id   uuid REFERENCES profiles ON DELETE SET NULL,
  action     text NOT NULL,
  target     text,
  details    jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_audit_created_idx ON admin_audit (created_at);

-- ── Private storage for refill photos ─────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('refill-photos', 'refill-photos', false)
ON CONFLICT (id) DO NOTHING;

-- ── Row level security ────────────────────────────────────────
ALTER TABLE riders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_declines    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_ledger      ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_codes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit       ENABLE ROW LEVEL SECURITY;

-- Riders may read (not write) their own application, wallet and withdrawals.
DROP POLICY IF EXISTS "riders_read_own" ON riders;
CREATE POLICY "riders_read_own" ON riders FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "ledger_read_own" ON rider_ledger;
CREATE POLICY "ledger_read_own" ON rider_ledger FOR SELECT USING (auth.uid() = rider_id);
DROP POLICY IF EXISTS "withdrawals_read_own" ON withdrawals;
CREATE POLICY "withdrawals_read_own" ON withdrawals FOR SELECT USING (auth.uid() = rider_id);
DROP POLICY IF EXISTS "declines_read_own" ON order_declines;
CREATE POLICY "declines_read_own" ON order_declines FOR SELECT USING (auth.uid() = rider_id);
-- support_questions, app_events, link_codes, payment_events, admin_audit: no client access at all (server routes only).

-- Orders: remove direct client writes. Riders and customers now go through
-- server routes that validate every change (status order, ownership, money).
DROP POLICY IF EXISTS "orders_rider_update"   ON orders;
DROP POLICY IF EXISTS "riders update assigned" ON orders;
DROP POLICY IF EXISTS "orders_rider_claim"    ON orders;
DROP POLICY IF EXISTS "orders_insert_any"     ON orders;
DROP POLICY IF EXISTS "customers insert orders" ON orders;
DROP POLICY IF EXISTS "orders_admin_all"      ON orders;
DROP POLICY IF EXISTS "admins all orders"     ON orders;
-- Catch-all: also drop any other insert/update/delete policy on orders that was
-- added by hand in the dashboard. Only read policies are kept.
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'orders' AND cmd <> 'SELECT' LOOP
    EXECUTE format('DROP POLICY %I ON public.orders', p.policyname);
  END LOOP;
END $$;

-- Notifications: only the server creates them (stops anyone sending a customer
-- a fake "pay to this number" message). Users can read, mark read and delete their own.
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' LOOP
    EXECUTE format('DROP POLICY %I ON public.notifications', p.policyname);
  END LOOP;
END $$;
CREATE POLICY "notifications_read_own"   ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Riders read full order details only for jobs they've accepted. Waiting requests
-- are served by the server with personal details removed (area, distance, earning only).
DROP POLICY IF EXISTS "orders_rider_read" ON orders;
DROP POLICY IF EXISTS "riders assigned orders" ON orders;
CREATE POLICY "orders_rider_read" ON orders FOR SELECT USING (auth.uid() = rider_id);

-- Profiles: users may still edit their own name/phone, but never their role.
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Only app users (signed in or anonymous) are blocked; the server and the SQL editor can still promote.
  IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
    NEW.role := OLD.role;            -- nobody promotes themselves
    NEW.is_active := OLD.is_active;  -- a blocked account can't unblock itself
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS profiles_role_guard ON profiles;
CREATE TRIGGER profiles_role_guard BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- New profiles created by users themselves can never start as rider/admin.
CREATE OR REPLACE FUNCTION public.force_customer_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
    NEW.role := 'customer';
    NEW.is_active := true;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS profiles_insert_role_guard ON profiles;
CREATE TRIGGER profiles_insert_role_guard BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.force_customer_role();

-- Realtime for the rider app (new requests appear instantly)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE rider_ledger;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
