import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { ADMIN_PIN } from '$env/static/private';
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from '$lib/server/adminAuth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const pin = form.get('pin')?.toString() ?? '';

		if (pin !== ADMIN_PIN) {
			return fail(401, { message: 'PIN이 올바르지 않습니다.' });
		}

		const token = await createAdminSessionToken();
		cookies.set(ADMIN_COOKIE_NAME, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 12
		});

		throw redirect(303, '/admin');
	}
};
