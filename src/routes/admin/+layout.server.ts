import { redirect } from '@sveltejs/kit';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '$lib/server/adminAuth';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	if (url.pathname === '/admin/login') {
		return {};
	}

	const token = cookies.get(ADMIN_COOKIE_NAME);
	const isValid = await verifyAdminSessionToken(token);

	if (!isValid) {
		throw redirect(303, '/admin/login');
	}

	const { data: statusData } = await supabaseAdmin
		.from('store_status')
		.select('*')
		.eq('id', 1)
		.single();

	return { storeOpen: statusData?.is_open ?? true };
};
