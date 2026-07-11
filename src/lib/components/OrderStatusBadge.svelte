<script lang="ts">
	import { ORDER_STATUS_LABEL, type OrderStatus } from '$lib/types';

	let { status }: { status: OrderStatus } = $props();

	const colors: Record<OrderStatus, string> = {
		pending: 'bg-stone-200 text-stone-700',
		making: 'bg-blue-100 text-blue-700',
		ready: 'bg-amber-100 text-amber-800',
		completed: 'bg-green-100 text-green-700'
	};
</script>

<span class="inline-block rounded-full px-3 py-1 text-sm font-semibold {colors[status]}">
	{ORDER_STATUS_LABEL[status]}
</span>
