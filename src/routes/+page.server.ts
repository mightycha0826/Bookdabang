import { fail, redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { MenuItem, StoreStatus } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [{ data, error }, { data: statusData }] = await Promise.all([
		supabase
			.from('menu_items')
			.select('*')
			.order('sort_order', { ascending: true })
			.order('created_at', { ascending: true }),
		supabase.from('store_status').select('*').eq('id', 1).single()
	]);

	if (error) {
		console.error('메뉴 로드 실패', error);
		return { menuItems: [] as MenuItem[], storeOpen: true };
	}

	return {
		menuItems: (data ?? []) as MenuItem[],
		storeOpen: statusData ? (statusData as StoreStatus).is_open : true
	};
};

export const actions: Actions = {
	order: async ({ request }) => {
		const { data: statusData } = await supabase
			.from('store_status')
			.select('is_open')
			.eq('id', 1)
			.single();
		if (statusData?.is_open === false) {
			return fail(403, { message: '지금은 주문을 받지 않습니다.' });
		}

		const form = await request.formData();
		const studentId = form.get('studentId')?.toString().trim();
		const menuItemId = form.get('menuItemId')?.toString();
		const hasTumbler = form.get('hasTumbler')?.toString() === 'true';

		if (!studentId || !/^\d{5}$/.test(studentId)) {
			return fail(400, { message: '학번 5자리를 정확히 입력해주세요.' });
		}
		if (!menuItemId) {
			return fail(400, { message: '음료를 선택해주세요.' });
		}

		const { data: menuItem, error: menuError } = await supabase
			.from('menu_items')
			.select('*')
			.eq('id', menuItemId)
			.single();

		if (menuError || !menuItem) {
			return fail(400, { message: '올바르지 않은 메뉴입니다.' });
		}
		if (menuItem.is_sold_out) {
			return fail(400, { message: `${menuItem.name}은(는) 품절되었습니다.` });
		}

		const { data: order, error: orderError } = await supabase
			.from('orders')
			.insert({
				student_id: studentId,
				has_tumbler: hasTumbler,
				menu_item_id: menuItem.id,
				menu_name: menuItem.name
			})
			.select()
			.single();

		if (orderError || !order) {
			console.error('주문 생성 실패', orderError);
			return fail(500, { message: '주문을 생성하지 못했습니다. 다시 시도해주세요.' });
		}

		throw redirect(303, `/order/${order.id}`);
	}
};
