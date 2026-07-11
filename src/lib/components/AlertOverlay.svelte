<script lang="ts">
	let {
		open,
		orderNumber,
		audioCtx,
		onDismiss
	}: {
		open: boolean;
		orderNumber: number;
		audioCtx?: AudioContext;
		onDismiss: () => void;
	} = $props();

	let beepInterval: ReturnType<typeof setInterval> | undefined;

	function playBeep() {
		if (!audioCtx) return;
		const oscillator = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		oscillator.type = 'sine';
		oscillator.frequency.value = 880;
		gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
		oscillator.connect(gain);
		gain.connect(audioCtx.destination);
		oscillator.start();
		oscillator.stop(audioCtx.currentTime + 0.4);
	}

	function startAlertSound() {
		if (!audioCtx) return;
		if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
		playBeep();
		beepInterval = setInterval(playBeep, 800);
	}

	function stopAlertSound() {
		clearInterval(beepInterval);
		beepInterval = undefined;
	}

	$effect(() => {
		if (open) {
			startAlertSound();
			if ('vibrate' in navigator) {
				navigator.vibrate([400, 200, 400, 200, 400]);
			}
		} else {
			stopAlertSound();
			navigator.vibrate?.(0);
		}

		return stopAlertSound;
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8 bg-stone-900 p-6 text-center"
		role="alertdialog"
		aria-live="assertive"
	>
		<div class="relative flex size-24 items-center justify-center">
			<span class="absolute inset-0 animate-ping rounded-full bg-white/20"></span>
			<span class="absolute inset-3 animate-ping rounded-full bg-white/30 [animation-delay:200ms]"
			></span>
			<span
				class="relative flex size-14 items-center justify-center rounded-full bg-white text-lg font-bold text-stone-900"
			>
				#{orderNumber}
			</span>
		</div>
		<div class="space-y-2">
			<p class="text-2xl font-bold text-white">{orderNumber}번 손님, 음료가 준비됐습니다</p>
			<p class="text-stone-300">픽업대로 와서 음료를 받아주세요.</p>
		</div>
		<button
			type="button"
			onclick={onDismiss}
			class="rounded-full bg-white px-10 py-4 text-base font-bold text-stone-900"
		>
			확인했어요
		</button>
	</div>
{/if}
