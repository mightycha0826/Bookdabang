import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { Order, OrderItem, OrderWithItems } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { data: orders } = await supabaseAdmin
		.from('orders')
		.select('*')
		.order('created_at', { ascending: true });

	const { data: items } = await supabaseAdmin.from('order_items').select('*');

	const itemsByOrder = new Map<string, OrderItem[]>();
	for (const item of (items ?? []) as OrderItem[]) {
		const list = itemsByOrder.get(item.order_id) ?? [];
		list.push(item);
		itemsByOrder.set(item.order_id, list);
	}

	const allOrders = (orders ?? []) as Order[];
	const withItems: OrderWithItems[] = allOrders.map((order) => ({
		...order,
		order_items: itemsByOrder.get(order.id) ?? []
	}));

	return {
		active: withItems.filter((o) => o.status !== 'completed'),
		completed: withItems
			.filter((o) => o.status === 'completed')
			.slice(-10)
			.reverse()
	};
};

function getOrderId(formData: FormData) {
	const orderId = formData.get('orderId')?.toString();
	return orderId && orderId.length > 0 ? orderId : null;
}

export const actions: Actions = {
	startMaking: async ({ request }) => {
		const orderId = getOrderId(await request.formData());
		if (!orderId) return fail(400, { message: '주문 ID가 없습니다.' });

		const { error } = await supabaseAdmin
			.from('orders')
			.update({ status: 'making' })
			.eq('id', orderId);
		if (error) return fail(500, { message: '상태 변경에 실패했습니다.' });
	},

	call: async ({ request }) => {
		const orderId = getOrderId(await request.formData());
		if (!orderId) return fail(400, { message: '주문 ID가 없습니다.' });

		const { error } = await supabaseAdmin
			.from('orders')
			.update({ status: 'ready', notified_at: new Date().toISOString() })
			.eq('id', orderId);
		if (error) return fail(500, { message: '호출에 실패했습니다.' });
	},

	complete: async ({ request }) => {
		const orderId = getOrderId(await request.formData());
		if (!orderId) return fail(400, { message: '주문 ID가 없습니다.' });

		const { error } = await supabaseAdmin
			.from('orders')
			.update({ status: 'completed' })
			.eq('id', orderId);
		if (error) return fail(500, { message: '완료 처리에 실패했습니다.' });
	},

	toggleOpen: async ({ request }) => {
		const formData = await request.formData();
		const isOpen = formData.get('isOpen')?.toString() === 'true';

		const { error } = await supabaseAdmin
			.from('store_status')
			.update({ is_open: !isOpen, updated_at: new Date().toISOString() })
			.eq('id', 1);
		if (error) return fail(500, { message: '영업 상태 변경에 실패했습니다.' });
	}
};
