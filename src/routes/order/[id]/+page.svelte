<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { supabase } from '$lib/supabase';
	import type { Order } from '$lib/types';
	import OrderStatusBadge from '$lib/components/OrderStatusBadge.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let order = $state<Order>(data.order);

	onMount(() => {
		const channel = supabase
			.channel(`order-${order.id}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'orders',
					filter: `id=eq.${order.id}`
				},
				(payload) => {
					order = payload.new as Order;
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	});
</script>

<svelte:head>
	<title>주문 #{order.order_number} — BOOK 다방</title>
</svelte:head>

<div class="mx-auto min-h-dvh max-w-md bg-stone-50 p-4">
	<header class="py-6 text-center">
		<p class="text-sm text-stone-500">픽업 번호</p>
		<p class="text-4xl font-extrabold text-stone-900">#{order.order_number}</p>
		<p class="mt-2 text-stone-600">{order.table_number}번 테이블 · {order.name}님</p>
		<p class="mt-1 text-xs text-stone-400">
			학번 {order.student_id} · {order.has_tumbler ? '개인 텀블러 사용' : '일회용 컵 사용'}
		</p>
	</header>

	<div class="flex justify-center">
		<OrderStatusBadge status={order.status} />
	</div>

	<section class="mt-6 rounded-xl bg-white p-4 text-center">
		<p class="text-sm text-stone-500">주문 음료</p>
		<p class="mt-1 text-lg font-semibold text-stone-900">{order.menu_name}</p>
		{#if order.refill_count > 0}
			<p
				class="mt-2 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700"
			>
				리필 {order.refill_count}회
			</p>
		{/if}
	</section>

	{#if order.status === 'completed'}
		<p class="mt-6 text-center text-sm text-stone-500">수령이 완료되었습니다. 감사합니다!</p>
	{:else}
		<p class="mt-6 text-center text-sm text-stone-500">
			직원이 학번을 불러드리면 픽업대에서 수령해주세요.
		</p>
	{/if}
	<a
		href={resolve('/')}
		class="mt-4 block rounded-lg bg-stone-900 py-3 text-center text-sm font-semibold text-white"
	>
		홈으로
	</a>
</div>
