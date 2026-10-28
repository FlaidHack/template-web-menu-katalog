<script lang="ts">
	import { onMount } from 'svelte';
	import { config } from '$lib/config.js';
	import { DAY_NAMES, formatHours, isOpenNow, zonedDayAndMinutes } from '$lib/format.js';
	import { buildJsonLdScript } from '$lib/seo.js';

	const jsonLd = buildJsonLdScript();
	const title = `Lokasi — ${config.name}`;
	const canonical = `${config.siteUrl}/lokasi`;
	const waUrl = `https://wa.me/${config.whatsapp}`;
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
	<meta name="description" content={`Lokasi dan alamat ${config.name}. Lihat peta, jam buka, dan cara memesan.`} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:site_name" content={config.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={`Lokasi, alamat, dan jam buka ${config.name}.`} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={`${config.siteUrl}/og.jpg`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={`Lokasi, alamat, dan jam buka ${config.name}.`} />
	<meta name="twitter:image" content={`${config.siteUrl}/og.jpg`} />
	<meta name="theme-color" content={config.brand.primary} />
	{@html jsonLd}
</svelte:head>

<main>
	<section class="border-b-2 border-ink bg-ink text-paper">
		<div class="mx-auto max-w-6xl px-4 py-10 sm:py-14">
			<p class="mono-label text-accent">LOKASI & ALAMAT</p>
			<div class="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<h1 class="font-display text-[clamp(4rem,10vw,8rem)] font-bold leading-[0.78] tracking-[-0.08em] text-paper">
					Mampir.
				</h1>
				<div class="border-l-2 border-accent pl-4 text-sm text-paper/90 sm:max-w-xs">
					<p class="font-display font-semibold text-paper">
						{openNow === null ? 'Jam buka harian' : openNow ? 'Buka sekarang' : 'Sedang tutup'}
					</p>
					<p class="mt-1 font-mono text-xs text-paper/70">
						{today === null ? '10.00–21.00' : `${DAY_NAMES[today]} · ${formatHours(config.hours[today])}`}
					</p>
				</div>
			</div>
			<p class="mt-7 max-w-2xl font-serif text-xl leading-relaxed text-paper/85">
				Peta, alamat lengkap, dan jam buka. Kalau bingung arah, kirim pesan—kami bantu tunjukkan patokannya.
			</p>
		</div>
	</section>

	<section class="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14">
		<div class="lg:col-span-7">
			<div class="border-2 border-ink bg-paper-light p-2">
				<iframe
					src={config.mapEmbedUrl}
					title={`Peta lokasi ${config.name}`}
					class="h-[320px] w-full border border-ink/20 sm:h-[420px] lg:h-[460px]"
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					allowfullscreen
				></iframe>
			</div>
			<div class="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-ink/25 pt-3">
				<p class="font-mono text-[11px] leading-relaxed tracking-[0.08em] text-ink/55">PETA LOKASI · GOOGLE MAPS</p>
				<a href={config.mapsUrl} target="_blank" rel="noopener noreferrer" class="text-link text-sm">
					Buka di Google Maps
				</a>
			</div>
		</div>

		<div class="lg:col-span-5">
			<div class="border-t-2 border-ink pt-5">
				<p class="mono-label text-brand">DETAIL ALAMAT</p>
				<h2 class="mt-3 font-display text-3xl font-bold leading-[0.92] tracking-[-0.055em] sm:text-4xl">
					{config.name}
				</h2>
				<p class="mt-4 max-w-md font-serif text-xl leading-relaxed text-ink/80">{config.address}</p>
				<p class="mt-3 max-w-md font-mono text-xs leading-relaxed text-ink/55">
					Buka peta di samping untuk rute langsung dari lokasi kamu.
				</p>
				<a href={config.mapsUrl} target="_blank" rel="noopener noreferrer" class="print-button mt-6 w-full sm:w-auto">
					Petunjuk arah
				</a>
			</div>

			<dl class="mt-8 divide-y divide-ink/20 border-y border-ink/20 text-sm">
				<div class="grid grid-cols-[7rem_1fr] gap-4 py-3">
					<dt class="font-mono text-xs text-ink/55">CARA TERIMA</dt>
					<dd class="font-medium">{fulfillment}</dd>
				</div>
				<div class="grid grid-cols-[7rem_1fr] gap-4 py-3">
					<dt class="font-mono text-xs text-ink/55">PESAN</dt>
					<dd>
						<a href={waUrl} target="_blank" rel="noopener noreferrer" class="text-link">WhatsApp</a>
					</dd>
				</div>
				{#if config.fulfillment.deliveryNote}
					<div class="grid grid-cols-[7rem_1fr] gap-4 py-3">
						<dt class="font-mono text-xs text-ink/55">ANTAR</dt>
						<dd class="text-ink/70">{config.fulfillment.deliveryNote}</dd>
					</div>
				{/if}
			</dl>

			<div class="mt-8">
				<div class="flex items-center justify-between gap-4 border-b-2 border-ink pb-3">
					<p class="mono-label text-brand">JAM BUKA</p>
					<span class="font-mono text-[10px] text-ink/50">WAKTU SETEMPAT</span>
				</div>
				<dl class="divide-y divide-ink/20">
					{#each DAY_NAMES as dayName, index (dayName)}
						<div class="flex items-center justify-between gap-4 py-2.5 {today === index ? 'font-semibold text-brand' : 'text-ink/75'}">
							<dt class="font-display font-semibold">{dayName}</dt>
							<dd class="font-mono text-sm tabular">{formatHours(config.hours[index])}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
	</section>

	<section class="border-t-2 border-ink bg-paper-light px-4 py-12">
		<div class="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="mono-label text-brand">SUDAH TAHU LOKASINYA?</p>
				<h2 class="mt-3 font-display text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.86] tracking-[-0.07em]">
					Langsung pilih menunya.
				</h2>
			</div>
			<a href="/menu" class="print-button w-fit">Lihat menu</a>
		</div>
	</section>
</main>
