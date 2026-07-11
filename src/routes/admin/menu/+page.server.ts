import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { MenuItem } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { data } = await supabaseAdmin
		.from('menu_items')
		.select('*')
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: true });

	return { menuItems: (data ?? []) as MenuItem[] };
};

function parseMenuForm(formData: FormData) {
	const name = formData.get('name')?.toString().trim();
	const priceRaw = formData.get('price')?.toString();
	const category = formData.get('category')?.toString().trim() || '기타';
	const description = formData.get('description')?.toString().trim() || null;
	const imageUrl = formData.get('imageUrl')?.toString().trim() || null;
	const price = Number(priceRaw);

	if (!name || !Number.isFinite(price) || price < 0) {
		return null;
	}

	return { name, price, category, description, image_url: imageUrl };
}

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const parsed = parseMenuForm(formData);
		if (!parsed) return fail(400, { message: '이름과 가격을 올바르게 입력해주세요.' });

		const { error } = await supabaseAdmin.from('menu_items').insert(parsed);
		if (error) return fail(500, { message: '메뉴 추가에 실패했습니다.' });
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const parsed = parseMenuForm(formData);
		if (!id || !parsed) return fail(400, { message: '입력값을 확인해주세요.' });

		const { error } = await supabaseAdmin.from('menu_items').update(parsed).eq('id', id);
		if (error) return fail(500, { message: '메뉴 수정에 실패했습니다.' });
	},

	toggleSoldOut: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const isSoldOut = formData.get('isSoldOut')?.toString() === 'true';
		if (!id) return fail(400, { message: '메뉴 ID가 없습니다.' });

		const { error } = await supabaseAdmin
			.from('menu_items')
			.update({ is_sold_out: !isSoldOut })
			.eq('id', id);
		if (error) return fail(500, { message: '품절 상태 변경에 실패했습니다.' });
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { message: '메뉴 ID가 없습니다.' });

		const { error } = await supabaseAdmin.from('menu_items').delete().eq('id', id);
		if (error) return fail(500, { message: '메뉴 삭제에 실패했습니다.' });
	}
};
