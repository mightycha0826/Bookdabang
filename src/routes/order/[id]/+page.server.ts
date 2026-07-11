import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { Order, OrderItem } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { data: order, error: orderError } = await supabase
		.from('orders')
		.select('*')
		.eq('id', params.id)
		.maybeSingle();

	if (orderError || !order) {
		throw error(404, '주문을 찾을 수 없습니다.');
	}

	const { data: items } = await supabase.from('order_items').select('*').eq('order_id', params.id);

	return {
		order: order as Order,
		items: (items ?? []) as OrderItem[]
	};
};
