<script lang="ts">
	import { onMount } from 'svelte';
	import { config } from '$lib/config.js';
	import catalogData from '$lib/data/products.json';
	import { DAY_NAMES, formatHours, isOpenNow, zonedDayAndMinutes } from '$lib/format.js';
	import { buildJsonLdScript } from '$lib/seo.js';
	import type { Product } from '$lib/types.js';

	const products = catalogData.products as Product[];
	const heroDishes = ['bakso-spesial', 'mie-ayam', 'nasi-goreng-kampung', 'sate']
		.map((id) => products.find((product) => product.id === id))
		.filter((product): product is Product => Boolean(product));
	const waUrl = `https://wa.me/${config.whatsapp}`;
	const jsonLd = buildJsonLdScript();
	const title = `${config.name} — ${config.tagline}`;
	const canonical = `${config.siteUrl}/`;
	const fulfillment = [
		config.fulfillment.dineIn ? 'Makan di tempat' : '',
		config.fulfillment.pickup ? 'Ambil sendiri' : '',
		config.fulfillment.delivery ? 'Antar' : ''
	]
		.filter(Boolean)
		.join(' · ');

	let openNow = $state<boolean | null>(null);
	let today = $state<number | null>(null);

	onMount(() => {
		const update = () => {
			openNow = isOpenNow();
			today = zonedDayAndMinutes(config.timezone).day;
		};

		update();
		const timer = setInterval(update, 60_000);
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={config.description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:site_name" content={config.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={config.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={`${config.siteUrl}/og.jpg`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={`${config.name} — ${config.tagline}`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={config.description} />
	<meta name="twitter:image" content={`${config.siteUrl}/og.jpg`} />
	<meta name="theme-color" content={config.brand.primary} />
	{@html jsonLd}
</svelte:head>

<main>
	<!-- 4.5625rem = tinggi SiteHeader (72px + 1px border), agar total layar pertama pas 100svh -->
	<section class="relative flex h-[calc(100svh-4.5625rem)] flex-col overflow-hidden pt-5 sm:pt-6">
		<div class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-6 sm:pb-8">
			<h1 class="text-center font-display text-[clamp(3rem,min(12.5vw,14svh),10rem)] font-bold leading-[0.8] tracking-[-0.075em]">
				<span class="block">Rasa rumah,</span>
				<span class="block font-serif font-medium italic tracking-[-0.06em] text-ink/90">tanpa perlu</span>
				<span class="block">
					<span class="inline-block bg-brand px-[0.1em] pb-[0.04em] text-paper">pulang.</span>
				</span>
			</h1>

			<div class="mt-auto border-t-2 border-ink pt-5">
				<div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div class="min-w-0">
						<p class="max-w-xl font-serif text-xl leading-[1.35] text-ink/75 sm:text-[22px]">
							Bakso, mie ayam, soto, dan camilan dari dapur kami. Pilih menu, tulis pesanan, lalu kirim langsung ke WhatsApp.
						</p>
						<p class="mt-4 font-mono text-[10px] tracking-[0.08em] text-ink/50 [@media(max-height:700px)]:hidden">{fulfillment}</p>
					</div>
					<div class="flex flex-wrap items-center gap-x-6 gap-y-4 lg:shrink-0">
						<a href="/menu" class="print-button">Lihat menu</a>
						<a href={waUrl} target="_blank" rel="noopener noreferrer" class="text-link text-sm">Pesan via WhatsApp</a>
					</div>
				</div>
			</div>
		</div>

		<div class="h-[38svh] min-h-0 border-t-2 border-ink sm:h-[32svh]">
			<div class="grid h-full grid-cols-2 grid-rows-2 gap-px bg-ink/25 lg:grid-cols-4 lg:grid-rows-1">
				{#each heroDishes as dish (dish.id)}
					<figure class="group relative min-h-0 overflow-hidden bg-paper">
						<img
							src={dish.image ?? '/products/placeholder.svg'}
							alt={dish.description ?? dish.name}
							loading="eager"
							decoding="async"
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
						/>
					</figure>
				{/each}
			</div>
		</div>
	</section>

	<section class="bg-brand px-4 py-16 text-paper sm:py-24">
		<div class="mx-auto max-w-6xl">
			<p class="mono-label text-paper/70">DARI DAPUR</p>
			<p class="mt-5 max-w-5xl font-serif text-[clamp(2.2rem,5.2vw,5rem)] leading-[0.95] tracking-[-0.045em]">
				“Tidak ada resep rahasia. Yang kami jaga cuma api, kaldu, dan jam buka.”
			</p>
			<p class="mt-7 font-display text-sm font-semibold">Warung Citarasa</p>
		</div>
	</section>

	<section id="dapur" class="px-4 py-16 sm:py-24">
		<div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-8">
			<div class="lg:col-span-4">
				<p class="mono-label text-brand">YANG KAMI JAGA</p>
				<h2 class="mt-4 max-w-sm font-display text-[clamp(2.5rem,4.5vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.065em]">
					Makan enak, tanpa banyak <span class="inline-block bg-brand px-[0.08em] text-paper">gaya.</span>
				</h2>
			</div>

			<div class="lg:col-span-8">
				<ol class="border-t border-ink/25">
					<li class="grid gap-4 border-b border-ink/25 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-8">
						<span class="font-mono text-sm text-brand">01</span>
						<div>
							<h3 class="font-display text-2xl font-semibold tracking-[-0.04em]">Kaldu dari pagi.</h3>
							<p class="mt-2 max-w-xl font-serif text-lg leading-relaxed text-ink/75">Kuah bakso dan soto dimasak sebelum warung buka, bukan diaduk saat ramai.</p>
						</div>
					</li>
					<li class="grid gap-4 border-b border-ink/25 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-8">
						<span class="font-mono text-sm text-brand">02</span>
						<div>
							<h3 class="font-display text-2xl font-semibold tracking-[-0.04em]">Sambal sesuai selera.</h3>
							<p class="mt-2 max-w-xl font-serif text-lg leading-relaxed text-ink/75">Mau pedas pelan atau pedas serius, tulis di catatan pesanan. Dapur akan menyesuaikan.</p>
						</div>
					</li>
					<li class="grid gap-4 border-b border-ink/25 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-8">
						<span class="font-mono text-sm text-brand">03</span>
						<div>
							<h3 class="font-display text-2xl font-semibold tracking-[-0.04em]">Harga ditulis jelas.</h3>
							<p class="mt-2 max-w-xl font-serif text-lg leading-relaxed text-ink/75">Yang tertulis di menu itu yang dibayar. Untuk pesanan acara, tanya dulu supaya pas dengan kebutuhan.</p>
						</div>
					</li>
				</ol>
			</div>
		</div>
	</section>

	<section id="kunjungi" class="border-y-2 border-ink bg-paper-light px-4 py-16 sm:py-20">
		<div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-8">
			<div class="lg:col-span-5">
				<p class="mono-label text-brand">KUNJUNGI ATAU PESAN</p>
				<h2 class="mt-4 font-display text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[0.86] tracking-[-0.07em]">Mampir juga boleh.</h2>
				<p class="mt-6 max-w-md font-serif text-xl leading-relaxed text-ink/75">{config.address}</p>
				<a href={config.mapsUrl} target="_blank" rel="noopener noreferrer" class="text-link mt-6 inline-block text-sm">Buka di Google Maps</a>
				<p class="mt-6 max-w-md text-sm leading-relaxed text-ink/65">{config.fulfillment.deliveryNote}</p>
			</div>

			<div class="lg:col-span-7">
				<div class="flex items-center gap-3 border-b-2 border-ink pb-4">
					<span class="h-2.5 w-2.5 {openNow === null ? 'bg-ink/35' : openNow ? 'bg-brand' : 'bg-ink/35'}"></span>
					<p class="font-display text-lg font-semibold">{openNow === null ? 'Jam buka' : openNow ? 'Buka sekarang' : 'Tutup sekarang'}</p>
					<span class="font-mono text-xs text-ink/55">WAKTU SETEMPAT</span>
				</div>
				<dl class="divide-y divide-ink/20">
					{#each DAY_NAMES as dayName, index (dayName)}
						<div class="flex items-center justify-between gap-4 py-3 {today === index ? 'text-brand' : ''}">
							<dt class="font-display text-lg font-semibold">{dayName}</dt>
							<dd class="font-mono text-sm tabular">{formatHours(config.hours[index])}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
	</section>

	<section class="bg-ink px-4 py-14 text-paper sm:py-20">
		<div class="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="mono-label text-paper/60">SUDAH LAPAR?</p>
				<h2 class="mt-3 font-display text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.84] tracking-[-0.075em]">Buka menunya.</h2>
			</div>
			<a href="/menu" class="inline-flex min-h-12 w-fit items-center border border-paper bg-paper px-5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:bg-brand hover:text-paper">Lihat semua menu</a>
		</div>
	</section>
</main>
