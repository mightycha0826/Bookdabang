<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { supabase } from '$lib/supabase';
	import OrderStatusBadge from '$lib/components/OrderStatusBadge.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const pending = $derived(data.active.filter((o) => o.status === 'pending'));
	const ready = $derived(data.active.filter((o) => o.status === 'ready'));

	onMount(() => {
		const channel = supabase
			.channel('admin-orders')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
				invalidateAll();
			})
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	});

	function timeLabel(iso: string) {
		return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>주문 현황 — BOOK 다방 관리자</title>
</svelte:head>

<div class="grid gap-4 sm:grid-cols-2">
	<section>
		<h2 class="mb-2 font-semibold text-stone-700">주문 접수 ({pending.length})</h2>
		<div class="space-y-3">
			{#each pending as order (order.id)}
				<article
					class="rounded-xl p-4 shadow-sm {order.refill_count > 0
						? 'border-2 border-green-500 bg-green-50'
						: 'bg-white'}"
				>
					<div class="flex items-start justify-between">
						<div>
							<div class="flex items-center gap-2">
								<p class="text-lg font-extrabold text-stone-900">{order.table_number}번 테이블</p>
								{#if order.refill_count > 0}
									<span class="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
										리필 {order.refill_count}회
									</span>
								{/if}
							</div>
							<p class="text-sm text-stone-600">
								#{order.order_number} · {order.name} (학번 {order.student_id})
							</p>
							<p class="text-xs text-stone-400">
								{timeLabel(order.created_at)} · {order.has_tumbler ? '텀블러' : '일회용 컵'}
							</p>
						</div>
						<OrderStatusBadge status={order.status} />
					</div>
					<p class="mt-2 text-sm text-stone-600">{order.menu_name}</p>
					<form method="POST" action="?/call" use:enhance class="mt-3">
						<input type="hidden" name="orderId" value={order.id} />
						<button
							type="submit"
							class="w-full rounded-full bg-stone-900 py-2 text-sm font-semibold text-white"
						>
							제작 완료
						</button>
					</form>
				</article>
			{:else}
				<p class="text-sm text-stone-400">대기 중인 주문이 없습니다.</p>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="mb-2 font-semibold text-stone-700">픽업 대기 ({ready.length})</h2>
		<div class="space-y-3">
			{#each ready as order (order.id)}
				<article
					class="rounded-xl p-4 shadow-sm {order.refill_count > 0
						? 'border-2 border-green-500 bg-green-50'
						: 'bg-white'}"
				>
					<div class="flex items-start justify-between">
						<div>
							<div class="flex items-center gap-2">
								<p class="text-lg font-extrabold text-stone-900">{order.table_number}번 테이블</p>
								{#if order.refill_count > 0}
									<span class="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
										리필 {order.refill_count}회
									</span>
								{/if}
							</div>
							<p class="text-sm text-stone-600">
								#{order.order_number} · {order.name} (학번 {order.student_id})
							</p>
							<p class="text-xs text-stone-400">
								{timeLabel(order.created_at)} · {order.has_tumbler ? '텀블러' : '일회용 컵'}
							</p>
						</div>
						<OrderStatusBadge status={order.status} />
					</div>
					<p class="mt-2 text-sm text-stone-600">{order.menu_name}</p>
					<div class="mt-3 flex gap-2">
						<form method="POST" action="?/call" use:enhance class="flex-1">
							<input type="hidden" name="orderId" value={order.id} />
							<button
								type="submit"
								class="w-full rounded-full bg-stone-100 py-2 text-sm font-semibold text-stone-700"
							>
								재호출
							</button>
						</form>
						<form method="POST" action="?/complete" use:enhance class="flex-1">
							<input type="hidden" name="orderId" value={order.id} />
							<button
								type="submit"
								class="w-full rounded-full bg-green-600 py-2 text-sm font-semibold text-white"
							>
								수령 완료
							</button>
						</form>
					</div>
				</article>
			{:else}
				<p class="text-sm text-stone-400">픽업 대기 중인 주문이 없습니다.</p>
			{/each}
		</div>
	</section>
</div>

{#if data.completed.length > 0}
	<details class="mt-8">
		<summary class="cursor-pointer text-sm font-medium text-stone-500">최근 완료된 주문</summary>
		<div class="mt-2 space-y-2">
			{#each data.completed as order (order.id)}
				<div class="rounded-lg bg-white px-3 py-2 text-sm text-stone-500">
					{order.table_number}번 테이블 · #{order.order_number} · {order.name} (학번 {order.student_id})
					· {order.menu_name}{order.refill_count > 0 ? ` · 리필 ${order.refill_count}회` : ''}
				</div>
			{/each}
		</div>
	</details>
{/if}
