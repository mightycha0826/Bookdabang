import { redirect } from '@sveltejs/kit';
import { ADMIN_COOKIE_NAME } from '$lib/server/adminAuth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
	throw redirect(303, '/admin/login');
};
