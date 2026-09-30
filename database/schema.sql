-- Schema v2 — đã chạy trực tiếp lên Neon ngày 2026-09-30
-- Giữ nguyên bảng cũ + thêm users, cột ảnh/mô tả sản phẩm, cột COD cho orders
create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null, name text not null,
  category text not null default 'Nội thất', brand text not null default 'Jotun',
  unit text not null default 'Lon 5L', price integer not null default 0,
  cost_price integer not null default 0, stock integer not null default 0,
  min_stock integer not null default 10, color_code text default '',
  finish text default '', description text default '',
  image_url text default '', coverage text default '',
  warranty text default '', features text default '',
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(), name text not null,
  phone text not null default '', address text default '', type text default 'Lẻ',
  debt integer default 0, total_bought integer default 0, created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(), name text not null,
  email text unique not null, phone text default '', address text default '',
  password_hash text not null, role text not null default 'customer',
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(), code text unique not null,
  customer_id uuid, customer_name text default 'Khách lẻ',
  total integer not null default 0, profit integer not null default 0,
  status text not null default 'Hoàn thành', payment text not null default 'Tiền mặt',
  note text default '', customer_phone text default '', address text default '',
  source text default 'pos', user_id uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null, qty integer not null default 1, price integer not null default 0
);

create table if not exists stock_moves (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  qty integer not null, kind text not null default 'import', note text default '',
  created_at timestamptz default now()
);

create index if not exists idx_products_cat on products(category);
create index if not exists idx_orders_date on orders(created_at desc);
create index if not exists idx_orders_source on orders(source);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_items_order on order_items(order_id);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  qty integer not null default 1,
  updated_at timestamptz default now(),
  unique(user_id, product_id)
);
create index if not exists idx_cart_user on cart_items(user_id);
