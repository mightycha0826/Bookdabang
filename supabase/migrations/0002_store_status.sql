-- BOOK 다방 영업 상태(수동 온/오프)

create table store_status (
  id integer primary key default 1 check (id = 1),
  is_open boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into store_status (id, is_open) values (1, true);

alter table store_status enable row level security;

-- store_status: 누구나 조회 가능(주문 가능 여부 확인). 쓰기는 service-role(관리자 서버 액션)만.
create policy "store_status_select_anon" on store_status
  for select
  to anon, authenticated
  using (true);

-- Realtime: 영업 상태 변경을 손님 화면(키오스크)에 즉시 반영
alter publication supabase_realtime add table store_status;
