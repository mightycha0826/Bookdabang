-- 리필 주문 여부 플래그 (기존 데이터를 보존하기 위해 파괴적인 재생성 대신 컬럼만 추가)

alter table orders add column if not exists is_refill boolean not null default false;
