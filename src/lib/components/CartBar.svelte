<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		items,
		totalCount,
		totalPrice,
		hasTumbler
	}: {
		items: { menuItemId: string; quantity: number }[];
		totalCount: number;
		totalPrice: number;
		hasTumbler: boolean;
	} = $props();

	let dialogOpen = $state(false);
	let customerName = $state('');
	let submitting = $state(false);
</script>

{#if totalCount > 0}
	<div
		class="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-3 backdrop-blur"
	>
		<div class="mx-auto flex max-w-4xl items-center justify-between gap-3">
			<div>
				<p class="text-xs text-stone-500">{totalCount}잔</p>
				<p class="text-lg font-bold text-stone-900">{totalPrice.toLocaleString()}원</p>
			</div>
			<button
				type="button"
				onclick={() => (dialogOpen = true)}
				class="rounded-lg bg-stone-900 px-8 py-3 text-sm font-semibold text-white"
			>
				주문하기
			</button>
		</div>
	</div>
{/if}

{#if dialogOpen}
	<div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
		<div class="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl">
			<h2 class="text-base font-bold text-stone-900">주문자 닉네임</h2>
			<p class="mt-1 text-sm text-stone-500">픽업 시 불러드릴 이름이나 닉네임을 입력해주세요.</p>

			<p
				class="mt-3 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
			>
				{hasTumbler ? '개인 텀블러 사용' : '일회용 컵 사용'}
			</p>

			<form
				method="POST"
				action="?/order"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
			>
				<input type="hidden" name="items" value={JSON.stringify(items)} />
				<input type="hidden" name="hasTumbler" value={hasTumbler} />
				<input
					type="text"
					name="customerName"
					bind:value={customerName}
					required
					maxlength="20"
					placeholder="예: 유근, 3반 차유근"
					class="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
				/>

				<div class="mt-4 flex gap-2">
					<button
						type="button"
						onclick={() => (dialogOpen = false)}
						class="flex-1 rounded-lg border border-stone-300 py-3 text-sm font-medium text-stone-700"
					>
						취소
					</button>
					<button
						type="submit"
						disabled={submitting || customerName.trim().length === 0}
						class="flex-1 rounded-lg bg-stone-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
					>
						{submitting ? '주문 중...' : '주문 확정'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
