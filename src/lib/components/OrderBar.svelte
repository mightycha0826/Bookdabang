<script lang="ts">
	import { enhance } from '$app/forms';
	import { supabase } from '$lib/supabase';
	import type { Order } from '$lib/types';

	let {
		selectedItem,
		hasTumbler
	}: {
		selectedItem: { id: string; name: string } | null;
		hasTumbler: boolean;
	} = $props();

	let dialogOpen = $state(false);
	let step = $state<'info' | 'table'>('info');
	let studentId = $state('');
	let name = $state('');
	let tableNumber = $state<number | null>(null);
	let submitting = $state(false);

	const studentIdValid = $derived(/^\d{5}$/.test(studentId));
	const infoValid = $derived(studentIdValid && name.trim().length > 0);

	function closeDialog() {
		dialogOpen = false;
		step = 'info';
	}

	let refillDialogOpen = $state(false);
	let refillStep = $state<'table' | 'result'>('table');
	let refillSearchInput = $state('');
	let refillSearchError = $state('');
	let refillTableNumber = $state<number | null>(null);
	let lookupLoading = $state(false);
	let previousOrder = $state<Order | null>(null);
	let refillCount = $state(0);
	let refillSubmitting = $state(false);

	function openRefillDialog() {
		refillDialogOpen = true;
		refillStep = 'table';
		refillSearchInput = '';
		refillSearchError = '';
		refillTableNumber = null;
		previousOrder = null;
		refillCount = 0;
	}

	function closeRefillDialog() {
		refillDialogOpen = false;
		refillStep = 'table';
		refillSearchInput = '';
		refillSearchError = '';
		refillTableNumber = null;
		previousOrder = null;
		refillCount = 0;
	}

	function submitTableSearch() {
		const n = Number(refillSearchInput);
		if (!Number.isInteger(n) || n < 1 || n > 10) {
			refillSearchError = '1~10 사이의 테이블 번호를 입력해주세요.';
			return;
		}
		refillSearchError = '';
		lookupTable(n);
	}

	async function lookupTable(n: number) {
		refillTableNumber = n;
		lookupLoading = true;

		const { data: rows } = await supabase
			.from('orders')
			.select('*')
			.eq('table_number', n)
			.order('created_at', { ascending: false })
			.limit(1);

		previousOrder = (rows?.[0] as Order | undefined) ?? null;

		if (previousOrder) {
			const { data: refillRows } = await supabase
				.from('orders')
				.select('id')
				.eq('table_number', n)
				.eq('is_refill', true);
			refillCount = refillRows?.length ?? 0;
		} else {
			refillCount = 0;
		}

		lookupLoading = false;
		refillStep = 'result';
	}
</script>

<div class="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-3 backdrop-blur">
	<div class="mx-auto flex max-w-4xl items-center justify-between gap-3">
		<div>
			{#if selectedItem}
				<p class="text-xs text-stone-500">선택한 음료</p>
				<p class="text-lg font-bold text-stone-900">{selectedItem.name}</p>
			{:else}
				<p class="text-sm text-stone-400">음료를 선택해주세요</p>
			{/if}
		</div>
		<div class="flex gap-2">
			<button
				type="button"
				onclick={openRefillDialog}
				class="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white"
			>
				리필하기
			</button>
			{#if selectedItem}
				<button
					type="button"
					onclick={() => (dialogOpen = true)}
					class="rounded-lg bg-stone-900 px-8 py-3 text-sm font-semibold text-white"
				>
					주문하기
				</button>
			{/if}
		</div>
	</div>
</div>

{#if dialogOpen && selectedItem}
	<div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
		<div class="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl">
			{#if step === 'info'}
				<h2 class="text-base font-bold text-stone-900">학번 · 이름 입력</h2>
				<p class="mt-1 text-sm text-stone-500">학번 5자리와 이름을 입력해주세요.</p>

				<p
					class="mt-3 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
				>
					{hasTumbler ? '개인 텀블러 사용' : '일회용 컵 사용'}
				</p>

				<input
					type="text"
					bind:value={studentId}
					inputmode="numeric"
					pattern={'[0-9]{5}'}
					maxlength="5"
					autocomplete="off"
					required
					placeholder="학번 5자리"
					class="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2 text-center text-lg tracking-widest focus:border-stone-500 focus:outline-none"
				/>
				<input
					type="text"
					bind:value={name}
					maxlength="20"
					autocomplete="off"
					required
					placeholder="이름"
					class="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
				/>

				<div class="mt-4 flex gap-2">
					<button
						type="button"
						onclick={closeDialog}
						class="flex-1 rounded-lg border border-stone-300 py-3 text-sm font-medium text-stone-700"
					>
						취소
					</button>
					<button
						type="button"
						disabled={!infoValid}
						onclick={() => (step = 'table')}
						class="flex-1 rounded-lg bg-stone-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
					>
						다음
					</button>
				</div>
			{:else}
				<h2 class="text-base font-bold text-stone-900">테이블 번호 선택</h2>
				<p class="mt-1 text-sm text-stone-500">앉아계신 테이블 번호를 선택해주세요.</p>

				<div class="mt-4 grid grid-cols-5 gap-2">
					{#each Array.from({ length: 10 }, (_, i) => i + 1) as n (n)}
						<button
							type="button"
							onclick={() => (tableNumber = n)}
							class="rounded-lg py-3 text-sm font-semibold {tableNumber === n
								? 'bg-stone-900 text-white'
								: 'border border-stone-300 text-stone-700'}"
						>
							{n}
						</button>
					{/each}
				</div>

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
					<input type="hidden" name="menuItemId" value={selectedItem.id} />
					<input type="hidden" name="hasTumbler" value={hasTumbler} />
					<input type="hidden" name="studentId" value={studentId} />
					<input type="hidden" name="name" value={name} />
					<input type="hidden" name="tableNumber" value={tableNumber ?? ''} />

					<div class="mt-4 flex gap-2">
						<button
							type="button"
							onclick={() => (step = 'info')}
							class="flex-1 rounded-lg border border-stone-300 py-3 text-sm font-medium text-stone-700"
						>
							뒤로
						</button>
						<button
							type="submit"
							disabled={submitting || tableNumber === null}
							class="flex-1 rounded-lg bg-stone-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
						>
							{submitting ? '주문 중...' : '주문 확정'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

{#if refillDialogOpen}
	<div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
		<div class="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl">
			{#if refillStep === 'table'}
				<h2 class="text-base font-bold text-stone-900">리필 · 테이블 번호 검색</h2>
				<p class="mt-1 text-sm text-stone-500">이전에 주문하셨던 테이블 번호를 입력해주세요.</p>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						submitTableSearch();
					}}
				>
					<input
						type="text"
						bind:value={refillSearchInput}
						inputmode="numeric"
						pattern="[0-9]*"
						maxlength="2"
						autocomplete="off"
						placeholder="테이블 번호 (1~10)"
						class="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2 text-center text-lg tracking-widest focus:border-stone-500 focus:outline-none"
					/>

					{#if refillSearchError}
						<p class="mt-2 text-center text-sm text-red-600">{refillSearchError}</p>
					{/if}

					<button
						type="submit"
						disabled={lookupLoading}
						class="mt-3 w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
					>
						{lookupLoading ? '검색 중...' : '검색'}
					</button>
				</form>

				<button
					type="button"
					onclick={closeRefillDialog}
					class="mt-2 w-full rounded-lg border border-stone-300 py-3 text-sm font-medium text-stone-700"
				>
					취소
				</button>
			{:else if previousOrder}
				<h2 class="text-base font-bold text-stone-900">{refillTableNumber}번 테이블 이전 주문</h2>

				<div class="mt-3 rounded-lg bg-stone-50 p-3 text-center">
					<p class="text-sm text-stone-500">{previousOrder.name}님</p>
					<p class="mt-1 text-lg font-semibold text-stone-900">{previousOrder.menu_name}</p>
				</div>

				{#if refillCount >= 1}
					<p
						class="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-center text-sm font-medium text-orange-700"
					>
						2번 이상 리필 괜찮으신가요?
					</p>
				{/if}

				<form
					method="POST"
					action="?/refill"
					use:enhance={() => {
						refillSubmitting = true;
						return async ({ update }) => {
							await update();
							refillSubmitting = false;
						};
					}}
				>
					<input type="hidden" name="previousOrderId" value={previousOrder.id} />

					<div class="mt-4 flex gap-2">
						<button
							type="button"
							onclick={() => (refillStep = 'table')}
							class="flex-1 rounded-lg border border-stone-300 py-3 text-sm font-medium text-stone-700"
						>
							뒤로
						</button>
						<button
							type="submit"
							disabled={refillSubmitting}
							class="flex-1 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
						>
							{refillSubmitting ? '리필 중...' : '리필하기'}
						</button>
					</div>
				</form>
			{:else}
				<h2 class="text-base font-bold text-stone-900">{refillTableNumber}번 테이블</h2>
				<p class="mt-2 text-sm text-stone-500">이전 주문 내역을 찾을 수 없습니다.</p>

				<div class="mt-4 flex gap-2">
					<button
						type="button"
						onclick={() => (refillStep = 'table')}
						class="flex-1 rounded-lg border border-stone-300 py-3 text-sm font-medium text-stone-700"
					>
						다른 테이블
					</button>
					<button
						type="button"
						onclick={closeRefillDialog}
						class="flex-1 rounded-lg bg-stone-900 py-3 text-sm font-semibold text-white"
					>
						새로 주문하기
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
