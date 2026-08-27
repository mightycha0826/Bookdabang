import { fail, redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
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
		const name = form.get('name')?.toString().trim();
		const tableNumberRaw = form.get('tableNumber')?.toString();
		const tableNumber = Number(tableNumberRaw);
		const menuItemId = form.get('menuItemId')?.toString();
		const hasTumbler = form.get('hasTumbler')?.toString() === 'true';

		if (!studentId || !/^\d{5}$/.test(studentId)) {
			return fail(400, { message: '학번 5자리를 정확히 입력해주세요.' });
		}
		if (!name) {
			return fail(400, { message: '이름을 입력해주세요.' });
		}
		if (!tableNumberRaw || !Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 10) {
			return fail(400, { message: '테이블 번호를 선택해주세요.' });
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
				name,
				table_number: tableNumber,
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
	},

	refill: async ({ request }) => {
		const { data: statusData } = await supabase
			.from('store_status')
			.select('is_open')
			.eq('id', 1)
			.single();
		if (statusData?.is_open === false) {
			return fail(403, { message: '지금은 주문을 받지 않습니다.' });
		}

		const form = await request.formData();
		const previousOrderId = form.get('previousOrderId')?.toString();
		if (!previousOrderId) {
			return fail(400, { message: '이전 주문 정보를 찾을 수 없습니다.' });
		}

		const { data: previousOrder, error: previousError } = await supabase
			.from('orders')
			.select('*')
			.eq('id', previousOrderId)
			.single();

		if (previousError || !previousOrder) {
			return fail(400, { message: '이전 주문 정보를 찾을 수 없습니다.' });
		}

		if (previousOrder.menu_item_id) {
			const { data: menuItem } = await supabase
				.from('menu_items')
				.select('is_sold_out')
				.eq('id', previousOrder.menu_item_id)
				.single();
			if (menuItem?.is_sold_out) {
				return fail(400, {
					message: `${previousOrder.menu_name}은(는) 품절되어 리필할 수 없습니다.`
				});
			}
		}

		const { data: order, error: orderError } = await supabaseAdmin
			.from('orders')
			.update({
				status: 'pending',
				notified_at: null,
				refill_count: previousOrder.refill_count + 1
			})
			.eq('id', previousOrder.id)
			.select()
			.single();

		if (orderError || !order) {
			console.error('리필 처리 실패', orderError);
			return fail(500, { message: '리필 처리를 하지 못했습니다. 다시 시도해주세요.' });
		}

		throw redirect(303, `/order/${order.id}`);
	}
};
