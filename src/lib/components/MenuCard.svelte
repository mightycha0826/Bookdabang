<script lang="ts">
	import type { MenuItem } from '$lib/types';

	let {
		item,
		selected,
		onSelect
	}: {
		item: MenuItem;
		selected: boolean;
		onSelect: () => void;
	} = $props();
</script>

<div
	class="flex flex-col overflow-hidden rounded-2xl border bg-white {selected
		? 'border-stone-900'
		: 'border-stone-200'}"
>
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
		<h3 class="truncate text-sm font-medium text-stone-900">{item.name}</h3>

		{#if !item.is_sold_out}
			<button
				type="button"
				onclick={onSelect}
				class="mt-auto rounded-full py-2 text-sm font-semibold {selected
					? 'bg-stone-900 text-white'
					: 'border border-stone-300 text-stone-700'}"
			>
				{selected ? '선택됨' : '선택'}
			</button>
		{/if}
	</div>
</div>
