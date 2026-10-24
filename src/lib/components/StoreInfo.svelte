<script lang="ts">
	import { config } from '$lib/config.js';
	import { DAY_NAMES, formatHours } from '$lib/format.js';

	let { open, today }: { open: boolean | null; today: number | null } = $props();
</script>

<section id="info" aria-labelledby="info-title" class="border-t border-ink/10 bg-surface">
	<div class="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 sm:py-12">
		<div class="space-y-4">
			<h2 id="info-title" class="font-display text-2xl font-semibold">Mampir atau pesan antar</h2>
			<div class="space-y-1 text-sm leading-relaxed">
				<p class="font-medium">{config.address}</p>
				<a
					href={config.mapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex min-h-11 items-center font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
				>
					Buka di Google Maps
				</a>
			</div>
			{#if config.fulfillment.deliveryNote}
				<p class="max-w-sm text-xs leading-relaxed text-ink/55">{config.fulfillment.deliveryNote}</p>
			{/if}
		</div>

		<div class="space-y-3">
			<div class="flex items-center gap-2">
				<span
					class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold
					{open === null
						? 'border-ink/15 text-ink/60'
						: open
							? 'border-accent/60 bg-accent/10 text-ink'
							: 'border-ink/15 bg-white text-ink/60'}"
				>
					<span
						class="h-2 w-2 rounded-full {open === null ? 'bg-ink/30' : open ? 'bg-accent' : 'bg-ink/30'}"
					></span>
					{open === null ? 'Cek jam buka' : open ? 'Buka sekarang' : 'Tutup'}
				</span>
				<span class="text-xs text-ink/50">Waktu setempat</span>
			</div>

			<dl class="divide-y divide-dashed divide-ink/15 text-sm">
				{#each DAY_NAMES as dayName, index (dayName)}
					<div
						class="flex items-center justify-between gap-4 py-2 {today === index ? 'font-semibold' : 'text-ink/70'}"
					>
						<dt>{dayName}</dt>
						<dd class="tabular">{formatHours(config.hours[index])}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</div>
</section>
