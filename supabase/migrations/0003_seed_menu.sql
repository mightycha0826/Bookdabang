-- BOOK 다방 초기 메뉴 시드
-- image_url은 이 프로젝트의 Supabase Storage 'menu' 버킷(public) 파일을 가리킴.
-- 다른 Supabase 프로젝트에 적용한다면 이미지도 새로 올리고 URL을 바꿔야 함.

insert into menu_items (name, category, sort_order, image_url) values
  (
    '청포도에이드',
    '에이드',
    1,
    'https://gdkgmimqhrpcatjfonwm.supabase.co/storage/v1/object/public/menu/image-1787815645656.png'
  ),
  (
    '블루레몬에이드',
    '에이드',
    2,
    'https://gdkgmimqhrpcatjfonwm.supabase.co/storage/v1/object/public/menu/image-1787815639774.webp'
  ),
  (
    '복숭아아이스티',
    '아이스티',
    3,
    'https://gdkgmimqhrpcatjfonwm.supabase.co/storage/v1/object/public/menu/image-1787815628430.png'
  );
