<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import MenuCard from '$lib/components/MenuCard.svelte';
	import OrderBar from '$lib/components/OrderBar.svelte';
	import type { StoreStatus } from '$lib/types';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let storeOpen = $state(data.storeOpen);
	const hasTumbler = false;
	let activeCategory = $state('전체');
	let selectedItemId = $state<string | null>(null);

	const categoryNames = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local, non-reactive helper set, discarded after this computation
		const seen = new Set<string>();
		const ordered: string[] = [];
		for (const item of data.menuItems) {
			if (!seen.has(item.category)) {
				seen.add(item.category);
				ordered.push(item.category);
			}
		}
		return ordered;
	});

	const visibleItems = $derived(
		activeCategory === '전체'
			? data.menuItems
			: data.menuItems.filter((item) => item.category === activeCategory)
	);

	const selectedItem = $derived(data.menuItems.find((item) => item.id === selectedItemId) ?? null);

	function toggleSelect(id: string) {
		selectedItemId = selectedItemId === id ? null : id;
	}

	onMount(() => {
		const channel = supabase
			.channel('store-status')
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'store_status', filter: 'id=eq.1' },
				(payload) => {
					storeOpen = (payload.new as StoreStatus).is_open;
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	});
</script>

<svelte:head>
	<title>BOOK 다방</title>
</svelte:head>

{#if !storeOpen}
	<div class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white p-6 text-center">
		<p class="text-sm font-medium tracking-widest text-stone-400">BOOK 다방</p>
		<h1 class="text-xl font-bold text-stone-900">지금은 주문을 받지 않습니다</h1>
		<p class="text-sm text-stone-500">잠시 후 다시 확인해주세요.</p>
	</div>
{:else}
	<div class="min-h-dvh bg-white pb-32">
		<header class="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
				<div>
					<p class="text-sm font-medium tracking-widest text-stone-400">BOOK 다방</p>
					<h1 class="text-base font-bold text-stone-900">메뉴</h1>
				</div>
				<button
					type="button"
					onclick={() => {
						selectedItemId = null;
						activeCategory = '전체';
					}}
					class="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600"
				>
					처음으로
				</button>
			</div>

			{#if categoryNames.length > 0}
				<nav class="mx-auto flex max-w-4xl gap-2 overflow-x-auto px-4 pb-3">
					<button
						type="button"
						onclick={() => (activeCategory = '전체')}
						class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium {activeCategory === '전체'
							? 'bg-stone-900 text-white'
							: 'bg-stone-100 text-stone-600'}"
					>
						전체
					</button>
					{#each categoryNames as category (category)}
						<button
							type="button"
							onclick={() => (activeCategory = category)}
							class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium {activeCategory ===
							category
								? 'bg-stone-900 text-white'
								: 'bg-stone-100 text-stone-600'}"
						>
							{category}
						</button>
					{/each}
				</nav>
			{/if}
		</header>

		{#if form?.message}
			<p class="mx-auto mt-4 max-w-4xl rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
				{form.message}
			</p>
		{/if}

		<main class="mx-auto max-w-4xl p-4">
			{#if data.menuItems.length === 0}
				<p class="py-16 text-center text-stone-400">아직 등록된 메뉴가 없습니다.</p>
			{:else}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{#each visibleItems as item (item.id)}
						<MenuCard
							{item}
							selected={selectedItemId === item.id}
							onSelect={() => toggleSelect(item.id)}
						/>
					{/each}
				</div>
			{/if}
		</main>
	</div>

	<OrderBar {selectedItem} {hasTumbler} />
{/if}
