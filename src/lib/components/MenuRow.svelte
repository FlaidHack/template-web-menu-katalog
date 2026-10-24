<script lang="ts">
	import { addActionLabel, isSoldOut, stockLabel } from '$lib/catalog.js';
	import { config } from '$lib/config.js';
	import { formatRupiah } from '$lib/format.js';
	import type { Product } from '$lib/types.js';

	let {
		product,
		index,
		onOpen,
		onAdd
	}: {
		product: Product;
		index: number;
		onOpen: (product: Product) => void;
		onAdd: (product: Product) => void;
	} = $props();

	const soldOut = $derived(isSoldOut(product));
	const stock = $derived(stockLabel(product));
	const hasVariants = $derived(Boolean(product.variants?.length));
	const price = $derived(product.price === null ? 'Tanya harga' : formatRupiah(product.price));
	const number = $derived(String(index + 1).padStart(2, '0'));
</script>

<li class="border-b border-ink/20 py-5 first:pt-0 {soldOut ? 'opacity-55' : ''}">
	<div class="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-4">
		<span class="pt-1 font-mono text-xs text-ink/45">{number}</span>
		<div class="min-w-0">
			<div class="flex items-baseline gap-3">
				<button type="button" class="min-w-0 text-left" onclick={() => onOpen(product)}>
					<h3 class="font-display text-xl font-semibold leading-tight tracking-[-0.04em] underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:decoration-brand sm:text-2xl">
						{product.name}
					</h3>
				</button>
				<span class="mb-1 min-w-3 flex-1 border-b border-dotted border-ink/35"></span>
				<p class="shrink-0 font-mono text-sm tabular">
					{hasVariants && product.price !== null ? 'mulai ' : ''}{price}
					{#if product.unit}
						<span class="text-[10px] text-ink/55">/{product.unit}</span>
					{/if}
				</p>
			</div>

			{#if product.description}
				<p class="mt-2 max-w-xl font-serif text-[17px] leading-snug text-ink/72">{product.description}</p>
			{/if}

			<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
				{#if stock}
					<span class="font-mono text-[11px] {soldOut ? 'text-brand' : 'text-ink/60'}">{stock}</span>
				{/if}
				{#if hasVariants && !soldOut}
					<span class="font-mono text-[11px] text-ink/55">Pilih varian di detail</span>
				{/if}
				<button type="button" class="text-link text-xs" onclick={() => onOpen(product)}>Lihat detail</button>
				<button
					type="button"
					disabled={soldOut}
					onclick={() => (hasVariants ? onOpen(product) : onAdd(product))}
					class="ml-auto inline-flex min-h-9 items-center border border-ink px-3 text-xs font-semibold transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink/45 disabled:hover:bg-transparent disabled:hover:text-ink/45"
				>
					{hasVariants && !soldOut ? 'Pilih' : addActionLabel(product, config)}
				</button>
			</div>
		</div>
	</div>
</li>
