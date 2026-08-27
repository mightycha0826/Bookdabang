<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let editingId = $state<string | null>(null);
</script>

<svelte:head>
	<title>메뉴 관리 — BOOK 다방 관리자</title>
</svelte:head>

<h1 class="mb-4 text-lg font-bold text-stone-900">메뉴 관리</h1>

{#if form?.message}
	<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
{/if}

<section class="mb-6 rounded-xl bg-white p-4 shadow-sm">
	<h2 class="mb-3 font-semibold text-stone-700">새 메뉴 추가</h2>
	<form method="POST" action="?/create" use:enhance class="grid gap-2 sm:grid-cols-2">
		<input
			name="name"
			required
			placeholder="메뉴 이름"
			class="rounded-lg border border-stone-300 px-3 py-2"
		/>
		<input
			name="category"
			placeholder="카테고리 (예: 커피)"
			class="rounded-lg border border-stone-300 px-3 py-2"
		/>
		<input
			name="imageUrl"
			placeholder="이미지 URL (선택)"
			class="rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2"
		/>
		<input
			name="description"
			placeholder="설명 (선택)"
			class="rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2"
		/>
		<button
			type="submit"
			class="rounded-full bg-amber-800 py-2 font-semibold text-white sm:col-span-2"
		>
			메뉴 추가
		</button>
	</form>
</section>

<div class="space-y-2">
	{#each data.menuItems as item (item.id)}
		<article class="rounded-xl bg-white p-4 shadow-sm">
			{#if editingId === item.id}
				<form
					method="POST"
					action="?/update"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							editingId = null;
						};
					}}
					class="grid gap-2 sm:grid-cols-2"
				>
					<input type="hidden" name="id" value={item.id} />
					<input
						name="name"
						required
						value={item.name}
						class="rounded-lg border border-stone-300 px-3 py-2"
					/>
					<input
						name="category"
						value={item.category}
						class="rounded-lg border border-stone-300 px-3 py-2"
					/>
					<input
						name="imageUrl"
						value={item.image_url ?? ''}
						placeholder="이미지 URL"
						class="rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2"
					/>
					<input
						name="description"
						value={item.description ?? ''}
						placeholder="설명"
						class="rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2"
					/>
					<div class="flex gap-2 sm:col-span-2">
						<button
							type="submit"
							class="flex-1 rounded-full bg-amber-800 py-2 text-sm font-semibold text-white"
						>
							저장
						</button>
						<button
							type="button"
							onclick={() => (editingId = null)}
							class="flex-1 rounded-full border border-stone-300 py-2 text-sm font-medium text-stone-700"
						>
							취소
						</button>
					</div>
				</form>
			{:else}
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<p class="font-semibold text-stone-900">{item.name}</p>
							<span class="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500"
								>{item.category}</span
							>
							{#if item.is_sold_out}
								<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
									>품절</span
								>
							{/if}
						</div>
						{#if item.description}
							<p class="text-sm text-stone-500">{item.description}</p>
						{/if}
					</div>

					<div class="flex shrink-0 flex-col items-end gap-2">
						<div class="flex gap-1">
							<button
								type="button"
								onclick={() => (editingId = item.id)}
								class="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700"
							>
								수정
							</button>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<button
									type="submit"
									onclick={(e) => {
										if (!confirm(`'${item.name}' 메뉴를 삭제할까요?`)) e.preventDefault();
									}}
									class="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600"
								>
									삭제
								</button>
							</form>
						</div>
						<form method="POST" action="?/toggleSoldOut" use:enhance>
							<input type="hidden" name="id" value={item.id} />
							<input type="hidden" name="isSoldOut" value={item.is_sold_out} />
							<button
								type="submit"
								class="rounded-full px-3 py-1 text-xs font-semibold {item.is_sold_out
									? 'bg-green-100 text-green-700'
									: 'bg-stone-800 text-white'}"
							>
								{item.is_sold_out ? '판매 재개' : '품절 처리'}
							</button>
						</form>
					</div>
				</div>
			{/if}
		</article>
	{:else}
		<p class="text-sm text-stone-400">등록된 메뉴가 없습니다.</p>
	{/each}
</div>
