-- ============================================================
-- 002 — Guest checkout + rider flow fixes
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- Also turn on: Authentication → Sign In / Providers → "Allow anonymous sign-ins"
-- ============================================================

-- 1. Contact details on each order, so the rider can call the customer
--    (riders cannot read customer profiles).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS contact_name  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS contact_phone text;

-- 1b. Rider name/phone copied onto the order when a rider accepts it, so the
--     customer's tracking page can show "Call rider" (customers cannot read
--     rider profiles, and a cross-table policy would recurse).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_name  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_phone text;

-- 1c. Bulk orders: one delivery can carry several cylinders of different sizes,
--     e.g. [{"kg":12,"qty":2,"unit":154.32},{"kg":6,"qty":1,"unit":77.16}]
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items jsonb;

-- 2. Every device gets its own guest account, so one person may appear on
--    two phones with the same number. Phone can no longer be unique.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;

-- 2b. Fix "Database error creating new user": the signup trigger must name the
--     schema explicitly (Supabase's auth service runs it with a different
--     search_path) and must not copy an empty phone ('') into profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NULLIF(NEW.phone, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Customers read only their own orders.
--    (The old rule also exposed every guest order to everyone.)
DROP POLICY IF EXISTS "orders_customer_read" ON orders;
DROP POLICY IF EXISTS "customers own orders" ON orders;
CREATE POLICY "orders_customer_read" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Riders can claim a paid, unassigned order (the old update rule only
--    allowed updating orders already assigned to them, so "Accept" did nothing).
DROP POLICY IF EXISTS "orders_rider_claim" ON orders;
CREATE POLICY "orders_rider_claim" ON orders
  FOR UPDATE
  USING (
    status = 'confirmed' AND rider_id IS NULL
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'rider')
  )
  WITH CHECK (rider_id = auth.uid());

-- 5. Riders (and admins) can send status notifications to the customer of an
--    order they handle. Customers still only read their own notifications.
DROP POLICY IF EXISTS "notifications_insert_for_order" ON notifications;
CREATE POLICY "notifications_insert_for_order" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.user_id = notifications.user_id AND o.rider_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
