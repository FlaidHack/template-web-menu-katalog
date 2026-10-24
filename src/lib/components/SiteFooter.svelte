<script lang="ts">
	import { config } from '$lib/config.js';
	import { DAY_NAMES, formatHours } from '$lib/format.js';

	const today = new Date().getDay();
</script>

<footer class="border-t-2 border-ink px-4 pb-6 pt-10">
	<div class="mx-auto max-w-6xl">
		<div class="flex flex-col gap-5 border-b border-ink/20 pb-8 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="font-display text-[clamp(2.25rem,7vw,5.5rem)] font-bold leading-[0.85] tracking-[-0.07em]">
					{config.name}
				</p>
				<p class="mt-4 max-w-sm font-serif text-lg italic leading-snug text-ink/75">{config.tagline}.</p>
			</div>
			<a href="#top" class="text-link shrink-0 text-sm">Kembali ke atas</a>
		</div>

		<div class="grid gap-8 py-7 text-sm sm:grid-cols-3">
			<div>
				<p class="mono-label text-ink/55">KUNJUNGI</p>
				<p class="mt-2 max-w-xs leading-relaxed">{config.address}</p>
				<a href={config.mapsUrl} target="_blank" rel="noopener noreferrer" class="text-link mt-3 inline-block">
					Buka peta
				</a>
			</div>

			<div>
				<p class="mono-label text-ink/55">JAM HARI INI</p>
				<p class="mt-2 font-mono text-sm">{DAY_NAMES[today]} · {formatHours(config.hours[today])}</p>
				<a href="/#kunjungi" class="text-link mt-3 inline-block">Lihat jam lengkap</a>
			</div>

			<div>
				<p class="mono-label text-ink/55">PESAN</p>
				<p class="mt-2 leading-relaxed">Pilih menu, isi nota, lalu cek pesan sebelum dikirim.</p>
				<a href="/menu" class="text-link mt-3 inline-block">Buka menu</a>
			</div>
		</div>

		<div class="flex flex-col gap-2 border-t border-ink/20 pt-5 text-xs text-ink/60 sm:flex-row sm:items-center sm:justify-between">
			<p>© {new Date().getFullYear()} {config.name}</p>
			<a href={config.credit.url} target="_blank" rel="noopener noreferrer" class="text-link w-fit">{config.credit.label}</a>
		</div>
	</div>
</footer>
