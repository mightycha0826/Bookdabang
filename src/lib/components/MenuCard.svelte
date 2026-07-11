<script lang="ts">
	import type { MenuItem } from '$lib/types';

	let {
		item,
		quantity,
		onIncrease,
		onDecrease
	}: {
		item: MenuItem;
		quantity: number;
		onIncrease: () => void;
		onDecrease: () => void;
	} = $props();
</script>

<div class="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
	<div class="relative aspect-square w-full bg-stone-100">
		{#if item.image_url}
			<img src={item.image_url} alt={item.name} class="size-full object-cover" loading="lazy" />
		{:else}
			<div
				class="flex size-full items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100"
			>
				<span class="text-sm font-medium text-stone-300">{item.name.slice(0, 1)}</span>
			</div>
		{/if}

		{#if item.is_sold_out}
			<div class="absolute inset-0 flex items-center justify-center bg-white/70">
				<span class="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white"
					>품절</span
				>
			</div>
		{/if}
	</div>

	<div class="flex flex-1 flex-col gap-2 p-3">
		<div class="min-w-0">
			<h3 class="truncate text-sm font-medium text-stone-900">{item.name}</h3>
			<p class="mt-0.5 text-sm font-semibold text-stone-900">{item.price.toLocaleString()}원</p>
		</div>

		{#if !item.is_sold_out}
			<div class="mt-auto flex items-center justify-between">
				<button
					type="button"
					onclick={onDecrease}
					disabled={quantity === 0}
					class="flex size-7 items-center justify-center rounded-full border border-stone-300 text-stone-500 disabled:opacity-30"
					aria-label="수량 감소"
				>
					−
				</button>
				<span class="text-sm tabular-nums text-stone-700">{quantity}</span>
				<button
					type="button"
					onclick={onIncrease}
					class="flex size-7 items-center justify-center rounded-full bg-stone-900 text-white"
					aria-label="수량 증가"
				>
					+
				</button>
			</div>
		{/if}
	</div>
</div>
