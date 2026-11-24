-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Enums
create type user_role as enum ('customer', 'rider', 'admin');
create type order_status as enum (
  'pending', 'confirmed', 'assigned', 'at_station',
  'collected', 'on_the_way', 'arriving', 'delivered', 'cancelled'
);
create type payment_status_enum as enum ('pending', 'paid', 'failed', 'refunded');
create type discount_type as enum ('fixed', 'percent');

-- Profiles (extends auth.users)
create table profiles (
  id           uuid references auth.users primary key,
  phone        text unique,
  name         text,
  avatar_url   text,
  role         user_role default 'customer',
  fcm_token    text,
  is_active    boolean default true,
  is_online    boolean default false,
  current_lat  double precision,
  current_lng  double precision,
  created_at   timestamptz default now()
);

-- Stations
create table stations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  address      text,
  lat          double precision not null,
  lng          double precision not null,
  phone        text,
  is_active    boolean default true,
  rating       numeric(3,2) default 0,
  rating_count int default 0,
  created_at   timestamptz default now()
);

-- Station prices per cylinder size
create table station_prices (
  id         uuid primary key default gen_random_uuid(),
  station_id uuid references stations on delete cascade,
  size_kg    int not null,
  price      numeric(10,2) not null,
  unique(station_id, size_kg)
);

-- Orders
create table orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text unique not null,
  user_id             uuid references profiles,
  guest_session_id    text,
  station_id          uuid references stations,
  station_name        text not null,
  cylinder_size       int not null,
  cylinder_name       text not null,
  quantity            int default 1,
  cylinder_price      numeric(10,2) not null,
  delivery_address    text not null,
  delivery_lat        double precision not null,
  delivery_lng        double precision not null,
  delivery_notes      text,
  subtotal            numeric(10,2) not null,
  delivery_fee        numeric(10,2) not null,
  safekeeping_fee     numeric(10,2) not null default 5,
  discount            numeric(10,2) not null default 0,
  total               numeric(10,2) not null,
  status              order_status default 'pending',
  rider_id            uuid references profiles,
  rider_lat           double precision,
  rider_lng           double precision,
  rider_heading       double precision,
  payment_status      payment_status_enum default 'pending',
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
  created_at          timestamptz default now()
);

-- Payments
create table payments (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid references orders unique,
  reference      text unique not null,
  amount         numeric(10,2) not null,
  status         text default 'pending',
  payment_method text default 'paystack',
  channel        text,
  paid_at        timestamptz,
  created_at     timestamptz default now()
);

-- Ratings
create table ratings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles,
  station_id uuid references stations,
  order_id   uuid references orders unique,
  rating     int check (rating between 1 and 5),
  comment    text,
  created_at timestamptz default now()
);

-- Addresses
create table addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles on delete cascade,
  label      text not null,
  address    text not null,
  lat        double precision not null,
  lng        double precision not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Coupons
create table coupons (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  discount_type  discount_type not null,
  discount_value numeric(10,2) not null,
  min_order      numeric(10,2),
  max_uses       int,
  used_count     int default 0,
  expires_at     timestamptz,
  is_active      boolean default true
);

-- Notifications
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles on delete cascade,
  type       text not null,
  title      text not null,
  message    text not null,
  data       jsonb,
  read       boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles     enable row level security;
alter table orders       enable row level security;
alter table payments     enable row level security;
alter table ratings      enable row level security;
alter table addresses    enable row level security;
alter table notifications enable row level security;

-- Profiles: users can read/update their own
create policy "users manage own profile" on profiles
  for all using (auth.uid() = id);

-- Stations: anyone can read
create policy "stations public read" on stations
  for select using (true);
create policy "station_prices public read" on station_prices
  for select using (true);

-- Orders: customers see own, riders see assigned+pending, admins see all
create policy "customers own orders" on orders
  for select using (
    auth.uid() = user_id
    or guest_session_id is not null
  );
create policy "riders assigned orders" on orders
  for select using (
    auth.uid() = rider_id
    or (status = 'confirmed' and rider_id is null and
        exists (select 1 from profiles where id = auth.uid() and role = 'rider'))
  );
create policy "admins all orders" on orders
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "customers insert orders" on orders
  for insert with check (true);
create policy "riders update assigned" on orders
  for update using (
    auth.uid() = rider_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Addresses: own only
create policy "users own addresses" on addresses
  for all using (auth.uid() = user_id);

-- Ratings: insert own, read all
create policy "users insert ratings" on ratings
  for insert with check (auth.uid() = user_id);
create policy "ratings public read" on ratings
  for select using (true);

-- Notifications: own only
create policy "users own notifications" on notifications
  for all using (auth.uid() = user_id);

-- Payments: user sees own via order
create policy "payments via order" on payments
  for select using (
    exists (select 1 from orders where orders.id = payments.order_id and orders.user_id = auth.uid())
  );

-- Enable Realtime on orders (for live tracking)
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table notifications;

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Function to claim guest orders after auth
create or replace function claim_guest_orders(p_guest_session_id text, p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update orders
  set user_id = p_user_id, guest_session_id = null
  where guest_session_id = p_guest_session_id
    and user_id is null
    and status not in ('delivered', 'cancelled');
end;
$$;

-- Seed: 8 Koforidua gas stations
insert into stations (name, address, lat, lng, phone, is_active) values
  ('GasPro Station', 'Koforidua Central, ER', 6.098813, -0.27765, '+233200000001', true),
  ('SafeGas Depot', 'Effiduase Road, Koforidua', 6.109447, -0.292065, '+233200000002', true),
  ('Energy Plus', 'Jackson Road, Koforidua', 6.1076519, -0.2799717, '+233200000003', true),
  ('QuickFlame', 'Koforidua New Road', 6.105526, -0.277021, '+233200000004', true),
  ('ClearGas Hub', 'Nsukwao, Koforidua', 6.117014, -0.251796, '+233200000005', true),
  ('FlamePoint', 'Old Tafo Road, Koforidua', 6.11364, -0.249552, '+233200000006', true),
  ('GasFirst', 'Accra Road, Koforidua', 6.104499, -0.250154, '+233200000007', true),
  ('PureGas', 'Adweso, Koforidua', 6.0754564, -0.2499899, '+233200000008', true);

-- Seed prices for each station (3kg, 6kg, 12kg, 14.5kg)
do $$
declare
  s record;
begin
  for s in select id from stations loop
    insert into station_prices (station_id, size_kg, price) values
      (s.id, 3,    round((random() * 5  + 40)::numeric, 2)),
      (s.id, 6,    round((random() * 8  + 78)::numeric, 2)),
      (s.id, 12,   round((random() * 15 + 155)::numeric, 2)),
      (s.id, 14,   round((random() * 18 + 190)::numeric, 2));
  end loop;
end;
$$;
