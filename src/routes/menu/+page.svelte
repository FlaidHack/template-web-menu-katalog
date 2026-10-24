<script lang="ts">
	import { onMount } from 'svelte';
	import CartDrawer from '$lib/components/CartDrawer.svelte';
	import MenuRow from '$lib/components/MenuRow.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import ProductSheet from '$lib/components/ProductSheet.svelte';
	import { cart } from '$lib/cart.svelte.js';
	import { ALL_CATEGORY, filterProducts, isSoldOut } from '$lib/catalog.js';
	import { config } from '$lib/config.js';
	import catalogData from '$lib/data/products.json';
	import { DAY_NAMES, formatHours, formatRupiah, isOpenNow, zonedDayAndMinutes } from '$lib/format.js';
	import { buildJsonLdScript } from '$lib/seo.js';
	import type { Product } from '$lib/types.js';

	const categories = catalogData.categories;
	const products = catalogData.products as Product[];
	const productById = new Map(products.map((product) => [product.id, product]));
	const jsonLd = buildJsonLdScript();
	const title = `Menu — ${config.name}`;
	const canonical = `${config.siteUrl}/menu`;

	let query = $state('');
	let activeCategory = $state(ALL_CATEGORY);
	let displayMode = $state(config.features.displayMode ?? 'ringkas');
	let activeProduct = $state<Product | null>(null);
	let cartOpen = $state(false);
	let openNow = $state<boolean | null>(null);
	let today = $state<number | null>(null);

	const visibleSections = $derived(
		categories
			.map((category) => ({ category, products: filterProducts(products, query, activeCategory === ALL_CATEGORY ? category : activeCategory) }))
			.filter((section) => section.category === activeCategory || activeCategory === ALL_CATEGORY)
			.filter((section) => section.products.length > 0)
	);
	const itemCount = $derived(visibleSections.reduce((count, section) => count + section.products.length, 0));
	const ticketLines = $derived(
		cart.items.flatMap((item) => {
			const product = productById.get(item.productId);
			return product ? [{ item, product }] : [];
		})
	);

	onMount(() => {
		cart.load();
		const update = () => {
			openNow = isOpenNow();
			today = zonedDayAndMinutes(config.timezone).day;
		};
		update();
		const timer = setInterval(update, 60_000);
		return () => clearInterval(timer);
	});

	function openProduct(product: Product) {
		activeProduct = product;
	}

	function addToCart(product: Product, variant: string | null, qty: number) {
		if (isSoldOut(product)) return;
		cart.add(product, variant, qty);
	}

	function quickAdd(product: Product) {
		addToCart(product, product.variants?.[0]?.label ?? null, 1);
	}

	function selectCategory(category: string) {
		activeCategory = category;
		query = '';
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={`Daftar menu dan harga ${config.name}. Pilih pesanan lalu kirim lewat WhatsApp.`} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:site_name" content={config.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={`Daftar menu dan harga ${config.name}.`} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={`${config.siteUrl}/og.jpg`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="theme-color" content={config.brand.primary} />
	{@html jsonLd}
</svelte:head>

<main class="pb-28 lg:pb-16">
	<section class="relative overflow-hidden border-b-2 border-ink bg-ink text-paper">
		<img
			src="/banner.jpg"
			alt=""
			width="1200"
			height="630"
			fetchpriority="high"
			class="absolute inset-0 h-full w-full object-cover object-center-right opacity-90"
		/>
		<div class="menu-banner-overlay absolute inset-0"></div>

		<div class="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p class="mono-label text-accent">DAFTAR MENU</p>
					<h1 class="mt-3 font-display text-[clamp(4rem,10vw,8rem)] font-bold leading-[0.78] tracking-[-0.08em] text-paper">
						Menu.
					</h1>
				</div>
				<div class="border-l-2 border-accent pl-4 text-sm text-paper/90 sm:max-w-xs">
					<p class="font-display font-semibold text-paper">
						{openNow === null ? 'Jam buka harian' : openNow ? 'Dapur buka sekarang' : 'Dapur sedang tutup'}
					</p>
					<p class="mt-1 font-mono text-xs text-paper/70">
						{today === null ? '10.00–21.00' : `${DAY_NAMES[today]} · ${formatHours(config.hours[today])}`}
					</p>
				</div>
			</div>
			<p class="mt-7 max-w-2xl font-serif text-xl leading-relaxed text-paper/85">
				Pilih yang mau dimakan. Untuk item dengan varian, buka detail dulu. Pesanan dirangkum di nota sebelum masuk ke WhatsApp.
			</p>
		</div>
	</section>

	<section class="border-b border-ink/25 bg-paper-light px-4 py-5">
		<div class="mx-auto max-w-6xl">
			<label for="search-menu" class="sr-only">Cari menu</label>
			<div class="flex items-center gap-3 border-b border-ink/55 pb-2">
				<svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
					<circle cx="11" cy="11" r="6.5" />
					<path d="m16 16 4 4" stroke-linecap="round" />
				</svg>
				<input id="search-menu" type="search" bind:value={query} placeholder="Cari menu" autocomplete="off" class="h-9 min-w-0 flex-1 bg-transparent text-base placeholder:text-ink/45 focus:outline-none" />
				{#if query}
					<button type="button" class="text-link shrink-0 text-xs" onclick={() => (query = '')}>Hapus</button>
				{/if}
			</div>

			<div class="-mx-4 mt-4 overflow-x-auto px-4 [scrollbar-width:none]">
				<div class="flex min-w-max items-center gap-x-5 text-sm sm:gap-x-7" role="group" aria-label="Filter kategori">
					{#each [ALL_CATEGORY, ...categories] as category (category)}
						<button
							type="button"
							aria-pressed={activeCategory === category}
							onclick={() => selectCategory(category)}
							class="border-b-2 pb-1 font-semibold transition-colors {activeCategory === category ? 'border-brand text-brand' : 'border-transparent text-ink/60 hover:border-ink/45 hover:text-ink'}"
						>
							{category}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="mx-auto grid max-w-6xl gap-12 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14 lg:py-14">
		<div>
			<div class="mb-8 flex items-baseline justify-between border-b border-ink/25 pb-3">
				<p class="font-serif text-lg italic text-ink/70">Pilih pelan-pelan, tidak perlu buru-buru.</p>
				<div class="flex items-center gap-3">
					<p class="font-mono text-xs text-ink/55" aria-live="polite">{itemCount} ITEM</p>
					<button
						type="button"
						aria-label="Ubah tampilan menu"
						onclick={() => (displayMode = displayMode === 'ringkas' ? 'foto' : 'ringkas')}
						class="grid h-9 w-9 shrink-0 place-items-center border border-ink/25 rounded-none text-ink/60 transition-colors hover:bg-ink hover:text-paper {displayMode === 'foto' ? 'bg-ink text-paper border-ink' : ''}"
					>
						{#if displayMode === 'foto'}
							<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
								<rect x="3" y="3" width="7" height="7" />
								<rect x="14" y="3" width="7" height="7" />
								<rect x="3" y="14" width="7" height="7" />
								<rect x="14" y="14" width="7" height="7" />
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
								<path d="M3 5h18M3 10h18M3 15h18M3 20h18" stroke-linecap="round" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			{#if visibleSections.length > 0}
				<div class="space-y-12">
					{#each visibleSections as section, sectionIndex (section.category)}
						<section aria-labelledby={`section-${section.category}`}>
							<div class="mb-6 flex items-end gap-4 border-b-2 border-ink pb-3">
								<span class="font-mono text-sm text-brand">{String(sectionIndex + 1).padStart(2, '0')}</span>
								<h2 id={`section-${section.category}`} class="font-display text-3xl font-bold leading-none tracking-[-0.055em] sm:text-4xl">{section.category}</h2>
								<span class="mb-0.5 ml-auto font-mono text-xs text-ink/55">{section.products.length} PILIHAN</span>
							</div>
						<ul class={displayMode === 'foto' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : ''}>
							{#each section.products as product, index (product.id)}
								{#if displayMode === 'foto'}
									<ProductCard {product} {index} onOpen={openProduct} onAdd={quickAdd} />
								{:else}
									<MenuRow {product} {index} onOpen={openProduct} onAdd={quickAdd} />
								{/if}
							{/each}
						</ul>
						</section>
					{/each}
				</div>
			{:else}
				<div class="border-y-2 border-ink py-12">
					<p class="font-display text-3xl font-bold tracking-[-0.05em]">Belum ketemu.</p>
					<p class="mt-3 max-w-md font-serif text-lg leading-relaxed text-ink/70">Tidak ada menu untuk “{query}”. Coba nama makanan lain atau pilih kategori berbeda.</p>
					<button type="button" class="text-link mt-5 text-sm" onclick={() => { query = ''; activeCategory = ALL_CATEGORY; }}>Tampilkan semua menu</button>
				</div>
			{/if}
		</div>

		<aside class="hidden lg:block">
			<div class="receipt-bottom sticky top-5 border-x border-t border-ink bg-paper-light p-5">
				<div class="flex items-start justify-between gap-4 border-b border-dashed border-ink/35 pb-4">
					<div>
						<p class="mono-label text-brand">NOTA PESANAN</p>
						<p class="mt-1 font-display text-xl font-bold tracking-[-0.04em]">{cart.count} item</p>
					</div>
					<span class="font-mono text-xs text-ink/55">{cart.count === 0 ? 'KOSONG' : 'AKTIF'}</span>
				</div>

				{#if ticketLines.length > 0}
					<ul class="divide-y divide-dashed divide-ink/25 py-3">
						{#each ticketLines.slice(0, 4) as { item, product } (item.productId + (item.variant ?? ''))}
							<li class="flex items-start justify-between gap-3 py-2 font-mono text-[11px] leading-snug">
								<span class="min-w-0">{item.qty}× {product.name}{item.variant ? ` (${item.variant})` : ''}</span>
								<span class="shrink-0">{item.unitPrice === null ? '?' : formatRupiah(item.unitPrice * item.qty)}</span>
							</li>
						{/each}
						{#if ticketLines.length > 4}
							<li class="py-2 font-mono text-[11px] text-ink/55">+ {ticketLines.length - 4} item lain</li>
						{/if}
					</ul>
				{:else}
					<p class="py-6 font-serif text-base leading-relaxed text-ink/65">Belum ada pesanan. Tambah menu dari daftar di samping.</p>
				{/if}

				<div class="border-t border-dashed border-ink/35 pt-4">
					<div class="flex items-baseline justify-between gap-4">
						<span class="font-mono text-xs">TOTAL</span>
						<strong class="font-mono text-base tabular">{cart.total === 0 && cart.hasUnpriced ? 'TANYA HARGA' : formatRupiah(cart.total)}</strong>
					</div>
					<button type="button" class="print-button mt-4 w-full" onclick={() => (cartOpen = true)}>Buka nota</button>
				</div>
			</div>
		</aside>
	</section>
</main>

{#if cart.count > 0}
	<div class="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-paper p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
		<div class="mx-auto flex max-w-6xl items-center gap-4">
			<div class="min-w-0 flex-1">
				<p class="font-mono text-[10px] text-ink/60">{cart.count} ITEM · NOTA PESANAN</p>
				<p class="font-display text-lg font-bold tabular">{cart.total === 0 && cart.hasUnpriced ? 'Tanya harga' : formatRupiah(cart.total)}</p>
			</div>
			<button type="button" class="print-button shrink-0" onclick={() => (cartOpen = true)}>Buka nota</button>
		</div>
	</div>
{/if}

<ProductSheet product={activeProduct} onClose={() => (activeProduct = null)} onAdd={addToCart} />
<CartDrawer open={cartOpen} onClose={() => (cartOpen = false)} />
