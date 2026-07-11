import { ADMIN_SESSION_SECRET } from '$env/static/private';

export const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12시간

function toBase64Url(bytes: ArrayBuffer): string {
	return Buffer.from(bytes).toString('base64url');
}

async function sign(payload: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(ADMIN_SESSION_SECRET),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
	return toBase64Url(signature);
}

export async function createAdminSessionToken(): Promise<string> {
	const expiresAt = Date.now() + SESSION_TTL_MS;
	const payload = String(expiresAt);
	const signature = await sign(payload);
	return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
	if (!token) return false;
	const [payload, signature] = token.split('.');
	if (!payload || !signature) return false;

	const expiresAt = Number(payload);
	if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

	const expectedSignature = await sign(payload);
	if (expectedSignature.length !== signature.length) return false;

	// 상수 시간 비교
	let mismatch = 0;
	for (let i = 0; i < expectedSignature.length; i++) {
		mismatch |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
	}
	return mismatch === 0;
}
