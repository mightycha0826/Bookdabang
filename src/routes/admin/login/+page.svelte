<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>관리자 로그인 — BOOK 다방</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center bg-stone-50 p-4">
	<div class="w-full max-w-xs rounded-2xl bg-white p-6 shadow-sm">
		<h1 class="text-lg font-bold text-stone-900">BOOK 다방 관리자</h1>
		<p class="mt-1 text-sm text-stone-500">운영진 PIN을 입력해주세요.</p>

		{#if form?.message}
			<p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<input
				type="password"
				name="pin"
				inputmode="numeric"
				autocomplete="off"
				required
				placeholder="PIN"
				class="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2 text-center text-lg tracking-widest focus:border-amber-700 focus:outline-none"
			/>
			<button
				type="submit"
				disabled={submitting}
				class="mt-4 w-full rounded-full bg-amber-800 py-3 font-semibold text-white disabled:opacity-50"
			>
				{submitting ? '확인 중...' : '로그인'}
			</button>
		</form>
	</div>
</div>
