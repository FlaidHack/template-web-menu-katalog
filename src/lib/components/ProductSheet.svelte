<script lang="ts">
	import { addActionLabel, initials, isSoldOut, stockLabel, variantPrice } from '$lib/catalog.js';
	import { config } from '$lib/config.js';
	import { formatRupiah } from '$lib/format.js';
	import type { Product } from '$lib/types.js';

	let {
		product,
		onClose,
		onAdd
	}: {
		product: Product | null;
		onClose: () => void;
		onAdd: (product: Product, variant: string | null, qty: number) => void;
	} = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let qty = $state(1);
	let selectedVariant = $state<string | null>(null);

	const price = $derived(product ? variantPrice(product, selectedVariant) : null);
	const soldOut = $derived(product ? isSoldOut(product) : false);

	$effect(() => {
		if (!dialogEl) return;
		if (product && !dialogEl.open) dialogEl.showModal();
		if (!product && dialogEl.open) dialogEl.close();
	});

	$effect(() => {
		if (!product) return;
		qty = 1;
		selectedVariant = product.variants?.[0]?.label ?? null;
	});

	function handleBackdrop(event: MouseEvent) {
		if (event.target === dialogEl) dialogEl?.close();
	}

	function add() {
		if (!product || soldOut) return;
		onAdd(product, selectedVariant, qty);
		dialogEl?.close();
	}
</script>

<dialog
	bind:this={dialogEl}
	onclose={onClose}
	onclick={handleBackdrop}
	class="m-0 ml-auto h-dvh max-h-none w-full max-w-none border-0 bg-paper p-0 backdrop:bg-ink/70 sm:w-[min(100%-2rem,34rem)]"
	aria-labelledby="sheet-title"
>
	{#if product}
		<div class="flex h-full flex-col overflow-y-auto">
			<header class="flex items-center justify-between border-b-2 border-ink px-4 py-4 sm:px-6">
				<div>
					<p class="mono-label text-brand">DETAIL MENU</p>
					<p class="mt-1 font-mono text-xs text-ink/55">{product.category.toUpperCase()}</p>
				</div>
				<button type="button" class="grid h-10 w-10 place-items-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper" aria-label="Tutup detail" onclick={() => dialogEl?.close()}>
					<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
						<path d="M6 6l12 12M18 6 6 18" />
					</svg>
				</button>
			</header>

			<div class="flex-1">
				{#if product.image}
					<img src={product.image} alt={product.name} width="800" height="600" class="aspect-[4/3] w-full border-b border-ink object-cover" />
				{:else}
					<div class="grid aspect-[4/3] place-items-center border-b border-ink bg-paper-light">
						<span aria-hidden="true" class="font-display text-7xl font-bold tracking-[-0.08em] text-ink/25">{initials(product.name)}</span>
					</div>
				{/if}

				<div class="space-y-8 px-4 py-6 sm:px-6 sm:py-8">
					<div>
						<div class="flex items-start justify-between gap-5">
							<h2 id="sheet-title" class="font-display text-4xl font-bold leading-[0.9] tracking-[-0.065em]">{product.name}</h2>
							<p class="shrink-0 font-mono text-sm tabular">{price === null ? 'Tanya harga' : formatRupiah(price)}</p>
						</div>
						{#if product.description}
							<p class="mt-4 max-w-md font-serif text-xl leading-snug text-ink/75">{product.description}</p>
						{/if}
						{#if product.stock}
							<p class="mt-4 font-mono text-xs {soldOut ? 'text-brand' : 'text-ink/60'}">{stockLabel(product)}</p>
						{/if}
					</div>

					{#if product.variants?.length}
						<fieldset class="border-y border-ink/25 py-5">
							<legend class="font-display text-lg font-semibold">Pilih varian</legend>
							<div class="mt-3 divide-y divide-ink/20">
								{#each product.variants as variant (variant.label)}
									<label class="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-2 text-sm">
										<span class="flex items-center gap-3">
											<input type="radio" name="varian" value={variant.label} bind:group={selectedVariant} class="h-4 w-4 accent-[var(--brand-primary)]" />
											<span class="font-semibold">{variant.label}</span>
										</span>
										<span class="font-mono text-xs">{variant.price === null ? 'Tanya harga' : formatRupiah(variant.price)}</span>
									</label>
								{/each}
							</div>
						</fieldset>
					{/if}

					<div class="flex items-center justify-between border-y border-ink/25 py-4">
						<span class="font-display text-lg font-semibold">Jumlah</span>
						<div class="flex items-center border border-ink">
							<button type="button" class="grid h-11 w-11 place-items-center text-lg transition-colors hover:bg-ink hover:text-paper disabled:opacity-35" aria-label="Kurangi jumlah" disabled={qty <= 1} onclick={() => (qty = Math.max(1, qty - 1))}>−</button>
							<span class="w-10 border-x border-ink text-center font-mono text-sm tabular" aria-live="polite">{qty}</span>
							<button type="button" class="grid h-11 w-11 place-items-center text-lg transition-colors hover:bg-ink hover:text-paper disabled:opacity-35" aria-label="Tambah jumlah" disabled={qty >= 99} onclick={() => (qty = Math.min(99, qty + 1))}>+</button>
						</div>
					</div>
				</div>
			</div>

			<footer class="border-t-2 border-ink p-4 sm:p-6">
				<button type="button" disabled={soldOut} onclick={add} class="print-button w-full disabled:cursor-not-allowed disabled:border-ink/25 disabled:bg-transparent disabled:text-ink/45 disabled:hover:bg-transparent disabled:hover:text-ink/45">
					{#if soldOut}
						Habis
					{:else}
						{addActionLabel(product, config)}
						{#if price !== null}<span class="ml-2 font-mono text-xs font-normal">{formatRupiah(price * qty)}</span>{/if}
					{/if}
				</button>
			</footer>
		</div>
	{/if}
</dialog>
