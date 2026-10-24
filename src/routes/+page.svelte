<script lang="ts">
	import { onMount } from 'svelte';
	import { config } from '$lib/config.js';
	import { DAY_NAMES, formatHours, isOpenNow, zonedDayAndMinutes } from '$lib/format.js';
	import { buildJsonLdScript } from '$lib/seo.js';
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
	<section class="px-4 pb-12 pt-10 sm:pb-18 sm:pt-16">
		<div class="mx-auto max-w-6xl">
			<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
				<div class="min-w-0 lg:col-span-7 lg:pt-8">
					<p class="mono-label text-brand">LOA JANAN, SAMARINDA · MASAK TIAP HARI</p>
					<h1 class="mt-5 max-w-3xl break-words font-display text-[clamp(2.9rem,12vw,7.5rem)] font-bold leading-[0.82] tracking-[-0.075em]">
						Rasa rumah,<br />
						<span class="font-serif font-medium italic tracking-[-0.06em]">tanpa perlu<br class="sm:hidden" /> pulang.</span>
					</h1>
					<p class="mt-7 max-w-xl font-serif text-xl leading-[1.3] text-ink/75 sm:text-2xl">
						Bakso, mie ayam, soto, dan camilan dari dapur kami. Pilih menu, tulis pesanan, lalu kirim langsung ke WhatsApp.
					</p>
					<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
						<a href="/menu" class="print-button">Lihat menu</a>
						<a href="#dapur" class="text-link text-sm">Kenal dapurnya</a>
					</div>
				</div>

				<div class="relative mx-auto w-full max-w-md lg:col-span-5 lg:mt-0 lg:max-w-none">
					<div class="absolute inset-x-4 bottom-[-14px] top-5 bg-brand"></div>
					<a href="/menu" class="relative block border border-ink bg-paper" aria-label="Lihat menu">
						<img
							src="/landing.jpg"
							alt="Pilihan hidangan Rumah Makan Citarasa"
							width="720"
							height="1280"
							fetchpriority="high"
							class="aspect-[4/5] w-full object-cover"
						/>
					</a>
					<div class="relative mt-4 flex items-start gap-3 border-t border-ink pt-3">
						<span class="font-mono text-sm text-brand">01</span>
						<p class="font-serif text-base leading-snug">
							<strong class="font-display">Rumah Makan Citarasa.</strong> Dari dapur, langsung ke meja makanmu.
						</p>
					</div>
				</div>
			</div>

			<div class="mt-14 grid border-y border-ink/25 sm:grid-cols-3">
				<div class="border-b border-ink/25 px-0 py-5 sm:border-b-0 sm:border-r sm:px-5">
					<p class="mono-label text-ink/55">JAM BUKA</p>
					<p class="mt-2 font-display text-lg font-semibold">
						{today === null ? 'Setiap hari' : `${DAY_NAMES[today]}, hari ini`} · {today === null ? '10.00–21.00' : formatHours(config.hours[today])}
					</p>
				</div>
				<div class="border-b border-ink/25 px-0 py-5 sm:border-b-0 sm:border-r sm:px-5">
					<p class="mono-label text-ink/55">CARA TERIMA</p>
					<p class="mt-2 font-display text-lg font-semibold">{fulfillment}</p>
				</div>
				<div class="px-0 py-5 sm:px-5">
					<p class="mono-label text-ink/55">STATUS DAPUR</p>
					<p class="mt-2 flex items-center gap-2 font-display text-lg font-semibold">
						<span class="h-2.5 w-2.5 {openNow === null ? 'bg-ink/35' : openNow ? 'bg-brand' : 'bg-ink/35'}"></span>
						{openNow === null ? 'Cek jam buka' : openNow ? 'Buka sekarang' : 'Sudah tutup'}
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="bg-brand px-4 py-16 text-paper sm:py-24">
		<div class="mx-auto max-w-6xl">
			<p class="mono-label text-paper/70">DARI DAPUR</p>
			<p class="mt-5 max-w-5xl font-serif text-[clamp(2.2rem,5.2vw,5rem)] leading-[0.95] tracking-[-0.045em]">
				“Tidak ada resep rahasia. Yang kami jaga cuma api, kaldu, dan jam buka.”
			</p>
			<p class="mt-7 font-display text-sm font-semibold">Warung Contoh Rasa</p>
		</div>
	</section>

	<section id="dapur" class="px-4 py-16 sm:py-24">
		<div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-8">
			<div class="lg:col-span-4">
				<p class="mono-label text-brand">YANG KAMI JAGA</p>
				<h2 class="mt-4 max-w-sm font-display text-[clamp(2.5rem,4.5vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.065em]">
					Makan enak, tanpa banyak gaya.
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
