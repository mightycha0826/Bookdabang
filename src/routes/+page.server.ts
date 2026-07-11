import { fail, redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { MenuItem } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { data, error } = await supabase
		.from('menu_items')
		.select('*')
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: true });

	if (error) {
		console.error('메뉴 로드 실패', error);
		return { menuItems: [] as MenuItem[] };
	}

	return { menuItems: (data ?? []) as MenuItem[] };
};

interface CartLine {
	menuItemId: string;
	quantity: number;
}

export const actions: Actions = {
	order: async ({ request }) => {
		const form = await request.formData();
		const customerName = form.get('customerName')?.toString().trim();
		const itemsRaw = form.get('items')?.toString();
		const hasTumbler = form.get('hasTumbler')?.toString() === 'true';

		if (!customerName) {
			return fail(400, { message: '닉네임을 입력해주세요.' });
		}

		let cartLines: CartLine[];
		try {
			cartLines = JSON.parse(itemsRaw ?? '[]');
		} catch {
			return fail(400, { message: '장바구니 정보를 읽을 수 없습니다.' });
		}

		if (!Array.isArray(cartLines) || cartLines.length === 0) {
			return fail(400, { message: '담긴 음료가 없습니다.' });
		}

		const ids = cartLines.map((line) => line.menuItemId);
		const { data: menuRows, error: menuError } = await supabase
			.from('menu_items')
			.select('*')
			.in('id', ids);

		if (menuError || !menuRows) {
			return fail(500, { message: '메뉴 정보를 불러오지 못했습니다.' });
		}

		const menuById = new Map(menuRows.map((row) => [row.id, row]));

		const orderItemsPayload: {
			menu_item_id: string;
			menu_name: string;
			unit_price: number;
			quantity: number;
		}[] = [];
		let totalPrice = 0;

		for (const line of cartLines) {
			const menuItem = menuById.get(line.menuItemId);
			const quantity = Number(line.quantity);

			if (!menuItem || !Number.isInteger(quantity) || quantity <= 0) {
				return fail(400, { message: '올바르지 않은 주문 항목이 있습니다.' });
			}
			if (menuItem.is_sold_out) {
				return fail(400, { message: `${menuItem.name}은(는) 품절되었습니다.` });
			}

			orderItemsPayload.push({
				menu_item_id: menuItem.id,
				menu_name: menuItem.name,
				unit_price: menuItem.price,
				quantity
			});
			totalPrice += menuItem.price * quantity;
		}

		const { data: order, error: orderError } = await supabase
			.from('orders')
			.insert({ customer_name: customerName, has_tumbler: hasTumbler, total_price: totalPrice })
			.select()
			.single();

		if (orderError || !order) {
			console.error('주문 생성 실패', orderError);
			return fail(500, { message: '주문을 생성하지 못했습니다. 다시 시도해주세요.' });
		}

		const { error: itemsError } = await supabase
			.from('order_items')
			.insert(orderItemsPayload.map((item) => ({ ...item, order_id: order.id })));

		if (itemsError) {
			console.error('주문 항목 저장 실패', itemsError);
			return fail(500, { message: '주문 항목을 저장하지 못했습니다.' });
		}

		throw redirect(303, `/order/${order.id}`);
	}
};
