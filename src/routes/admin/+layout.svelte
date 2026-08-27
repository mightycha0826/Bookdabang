<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

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
			<div class="flex items-center gap-3">
				<form method="POST" action="/admin?/toggleOpen" use:enhance>
					<input type="hidden" name="isOpen" value={data.storeOpen} />
					<button
						type="submit"
						class="rounded-full px-3 py-1.5 text-xs font-semibold {data.storeOpen
							? 'bg-green-100 text-green-700'
							: 'bg-red-100 text-red-700'}"
					>
						{data.storeOpen ? '영업 중 · 끄기' : '영업 종료 · 켜기'}
					</button>
				</form>
				<form method="POST" action="/admin/logout">
					<button type="submit" class="text-sm text-stone-500 hover:text-red-600">로그아웃</button>
				</form>
			</div>
		</header>

		<main class="mx-auto max-w-5xl p-4">
			{@render children()}
		</main>
	</div>
{/if}
