<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const isLoginPage = $derived(page.url.pathname === '/admin/login');
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="min-h-dvh bg-stone-100">
		<header class="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
			<div class="flex items-center gap-4">
				<span class="font-bold text-stone-900">BOOK 다방 관리자</span>
				<nav class="flex gap-3 text-sm">
					<a href={resolve('/admin')} class="text-stone-600 hover:text-amber-800">주문 현황</a>
					<a href={resolve('/admin/menu')} class="text-stone-600 hover:text-amber-800">메뉴 관리</a>
				</nav>
			</div>
			<form method="POST" action="/admin/logout">
				<button type="submit" class="text-sm text-stone-500 hover:text-red-600">로그아웃</button>
			</form>
		</header>

		<main class="mx-auto max-w-5xl p-4">
			{@render children()}
		</main>
	</div>
{/if}
