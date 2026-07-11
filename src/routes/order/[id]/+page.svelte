<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import type { Order } from '$lib/types';
	import OrderStatusBadge from '$lib/components/OrderStatusBadge.svelte';
	import AlertOverlay from '$lib/components/AlertOverlay.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let order = $state<Order>(data.order);
	let showAlert = $state(false);
	let notifyReady = $state(false);
	let audioCtx = $state<AudioContext | undefined>(undefined);

	function enableNotifications() {
		if (!audioCtx) {
			audioCtx = new AudioContext();
		}
		if (audioCtx.state === 'suspended') {
			audioCtx.resume().catch(() => {});
		}
		notifyReady = true;
	}

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
					const updated = payload.new as Order;
					const wasNotified = order.notified_at;
					order = updated;
					if (updated.notified_at && updated.notified_at !== wasNotified) {
						showAlert = true;
					}
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
		<p class="mt-2 text-stone-600">{order.customer_name}님</p>
		<p class="mt-1 text-xs text-stone-400">
			{order.has_tumbler ? '개인 텀블러 사용' : '일회용 컵 사용'}
		</p>
	</header>

	<div class="flex justify-center">
		<OrderStatusBadge status={order.status} />
	</div>

	<section class="mt-6 space-y-2 rounded-xl bg-white p-4">
		{#each data.items as item (item.id)}
			<div class="flex justify-between text-sm text-stone-700">
				<span>{item.menu_name} × {item.quantity}</span>
				<span>{(item.unit_price * item.quantity).toLocaleString()}원</span>
			</div>
		{/each}
		<div
			class="mt-2 flex justify-between border-t border-stone-200 pt-2 font-semibold text-stone-900"
		>
			<span>합계</span>
			<span>{order.total_price.toLocaleString()}원</span>
		</div>
	</section>

	{#if !notifyReady}
		<button
			type="button"
			onclick={enableNotifications}
			class="mt-6 w-full rounded-xl bg-stone-900 py-4 font-semibold text-white"
		>
			준비 완료 알림 받기
		</button>
		<p class="mt-2 text-center text-xs text-stone-400">
			이 버튼을 눌러야 음료가 준비됐을 때 소리/진동 알림을 받을 수 있어요. 이 화면을 계속
			열어두세요.
		</p>
	{:else}
		<p class="mt-6 text-center text-sm text-stone-500">
			알림 대기 중이에요. 이 화면을 열어두면 음료가 준비될 때 알려드려요.
		</p>
	{/if}
</div>

<AlertOverlay
	open={showAlert}
	orderNumber={order.order_number}
	{audioCtx}
	onDismiss={() => (showAlert = false)}
/>
