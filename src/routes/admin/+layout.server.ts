import { redirect } from '@sveltejs/kit';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '$lib/server/adminAuth';
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

	return {};
};
