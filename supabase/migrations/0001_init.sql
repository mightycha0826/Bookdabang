-- BOOK 다방 초기 스키마

create extension if not exists pgcrypto;

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default '기타',
  image_url text,
  is_sold_out boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create sequence order_number_seq start 1;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null default nextval('order_number_seq'),
  student_id text not null check (student_id ~ '^\d{5}$'),
  has_tumbler boolean not null default false,
  menu_item_id uuid references menu_items(id) on delete set null,
  menu_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'making', 'ready', 'completed')),
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index orders_status_idx on orders(status);

-- Row Level Security
alter table menu_items enable row level security;
alter table orders enable row level security;

-- menu_items: 누구나 조회 가능. 쓰기는 service-role(관리자 서버 액션)만 가능하도록 정책 미생성.
create policy "menu_items_select_anon" on menu_items
  for select
  to anon, authenticated
  using (true);

-- orders: 익명 주문 생성 및 자신의 주문(UUID를 아는 사람) 조회 허용. 수정/삭제는 service-role만.
create policy "orders_insert_anon" on orders
  for insert
  to anon, authenticated
  with check (true);

create policy "orders_select_anon" on orders
  for select
  to anon, authenticated
  using (true);

-- Realtime: 주문 상태 변경을 손님/관리자 화면에 실시간으로 반영
alter publication supabase_realtime add table orders;
