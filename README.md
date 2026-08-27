# BOOK 다방

학교 카페 "BOOK 다방"을 위한 음료 주문/관리 웹앱. SvelteKit + Supabase.

- 손님 페이지 (`/`): 메뉴 중 1개 선택(무료, 1인 1잔), 학번(5자리) 입력 후 주문
- 주문 상태 페이지 (`/order/[id]`): 실시간 주문 상태 표시(픽업은 직원이 학번을 불러 안내)
- 관리자 페이지 (`/admin`): PIN 로그인, 실시간 주문 현황, 호출/완료 처리, 영업 종료/시작 토글
- 메뉴 관리 (`/admin/menu`): 메뉴 CRUD, 품절 토글

## 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만든다.
2. 프로젝트의 **SQL Editor**에서 [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) 내용을 그대로 실행한다. (테이블, RLS 정책, Realtime publication이 함께 설정됨)
3. 이어서 [`supabase/migrations/0002_store_status.sql`](supabase/migrations/0002_store_status.sql) 내용을 실행한다. (영업 상태 테이블 및 RLS, Realtime publication 추가)
4. 마지막으로 [`supabase/migrations/0003_seed_menu.sql`](supabase/migrations/0003_seed_menu.sql) 내용을 실행한다. (초기 메뉴 3종 등록)
5. **Project Settings → API**에서 다음 값을 확인한다.
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` 키 → `SUPABASE_SERVICE_ROLE_KEY` (절대 외부에 노출 금지, 서버에서만 사용)

## 2. 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 값을 채운다.

```sh
cp .env.example .env
```

```
PUBLIC_SUPABASE_URL=          # Supabase 프로젝트 URL
PUBLIC_SUPABASE_ANON_KEY=     # anon public 키
SUPABASE_SERVICE_ROLE_KEY=    # service_role 키 (서버 전용)
ADMIN_PIN=                    # 관리자 로그인 PIN (원하는 숫자/문자열)
ADMIN_SESSION_SECRET=         # 관리자 로그인 세션 쿠키 서명용 임의의 긴 문자열
```

## 3. 로컬 실행

```sh
npm install
npm run dev -- --open
```

- 손님 화면: `http://localhost:5173/`
- 관리자 화면: `http://localhost:5173/admin/login` (`.env`의 `ADMIN_PIN`으로 로그인)

## 4. 동작 흐름

1. 손님이 메뉴 중 하나를 선택하고 학번 5자리를 입력해 주문 → `/order/[id]`로 이동, 픽업 번호 확인.
2. 관리자가 `/admin`에서 주문을 확인하고 "제조 시작" → 완료되면 "호출" 클릭(주문 상태가 실시간으로 손님 화면에도 반영됨).
3. 직원이 학번을 직접 불러 픽업을 안내한다(앱이 소리/진동으로 알려주지 않음).
4. 손님이 픽업하면 관리자가 "수령 완료"를 클릭한다.

메뉴 품절/판매 재개는 `/admin/menu`에서 토글하면 손님 화면에 즉시 반영된다(새로고침 또는 재방문 시).

## 배포

기본 어댑터는 `@sveltejs/adapter-auto`. Vercel/Node 등 배포 환경에 맞춰 필요하면 `svelte.config.js`의 어댑터를 교체한다 (예: Cloudflare Pages를 쓴다면 `@sveltejs/adapter-cloudflare` 설치 후 교체).

배포 환경에도 위 환경 변수(`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PIN`, `ADMIN_SESSION_SECRET`)를 동일하게 설정해야 한다.
