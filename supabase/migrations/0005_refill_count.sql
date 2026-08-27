-- 리필은 새 주문 행을 만들지 않고 기존 주문을 그대로 재사용하도록 변경.
-- is_refill(불리언)을 리필 횟수 카운터로 대체.

alter table orders add column if not exists refill_count integer not null default 0;

update orders set refill_count = 1 where is_refill = true;

alter table orders drop column if exists is_refill;
