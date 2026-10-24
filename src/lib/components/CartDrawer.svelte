<script lang="ts">
	import { cart } from '$lib/cart.svelte.js';
	import { config } from '$lib/config.js';
	import catalogData from '$lib/data/products.json';
	import { formatRupiah } from '$lib/format.js';
	import { buildOrderMessage, buildWaUrl, isUrlTooLong, type Fulfillment, type OrderLine } from '$lib/whatsapp.js';
	import type { Product } from '$lib/types.js';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	const products = catalogData.products as Product[];
	const productById = new Map(products.map((product) => [product.id, product]));

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let attempted = $state(false);
	let sent = $state(false);
	let copied = $state(false);
	let confirmClear = $state(false);
	let table = $state('');
	let note = $state('');

	function defaultMode(): 'dine-in' | 'pickup' | 'delivery' {
		if (config.fulfillment.dineIn) return 'dine-in';
		if (config.fulfillment.pickup) return 'pickup';
		return 'delivery';
	}

	let mode = $state<'dine-in' | 'pickup' | 'delivery'>(defaultMode());

	const lines = $derived(
		cart.items.flatMap((item) => {
			const product = productById.get(item.productId);
			return product ? [{ item, product }] : [];
		})
	);

	const nameError = $derived(attempted && !cart.buyer.name.trim() ? 'Isi nama pemesan.' : '');
	const addressError = $derived(
		attempted && mode === 'delivery' && !cart.buyer.address.trim() ? 'Isi alamat antar.' : ''
	);

	const preview = $derived.by(() => {
		if (cart.items.length === 0) return { message: '', url: '', tooLong: false };

		const orderLines: OrderLine[] = cart.items.map((item) => ({
			name: productById.get(item.productId)?.name ?? item.productId,
			variant: item.variant,
			qty: item.qty,
			unitPrice: item.unitPrice,
			note: item.note
		}));

		const fulfillment: Fulfillment =
			mode === 'dine-in'
				? { mode: 'dine-in', table }
				: mode === 'delivery'
					? { mode: 'delivery', address: cart.buyer.address }
					: { mode: 'pickup' };

		const message = buildOrderMessage({
			lines: orderLines,
			customerName: cart.buyer.name,
			fulfillment,
			note
		});
		const url = buildWaUrl(config.whatsapp, message);

		return { message, url, tooLong: isUrlTooLong(url) };
	});

	$effect(() => {
		if (!dialogEl) return;

		if (open && !dialogEl.open) {
			dialogEl.showModal();
		} else if (!open && dialogEl.open) {
			dialogEl.close();
		}
	});

	function handleClose() {
		attempted = false;
		sent = false;
		copied = false;
		confirmClear = false;
		onClose();
	}

	function handleBackdrop(event: MouseEvent) {
		if (event.target === dialogEl) {
			dialogEl?.close();
		}
	}

	function send() {
		attempted = true;
		if (!preview.url || nameError || addressError) return;

		window.open(preview.url, '_blank', 'noopener,noreferrer');
		sent = true;
	}

	async function copyMessage() {
		if (!preview.message) return;

		try {
			await navigator.clipboard.writeText(preview.message);
			copied = true;
		} catch {
			const area = document.createElement('textarea');
			area.value = preview.message;
			area.style.position = 'fixed';
			area.style.opacity = '0';
			document.body.appendChild(area);
			area.select();

			try {
				copied = document.execCommand('copy');
			} catch {
				copied = false;
			}

			area.remove();
		}

		setTimeout(() => (copied = false), 2500);
	}
</script>

<dialog
	bind:this={dialogEl}
	onclose={handleClose}
	onclick={handleBackdrop}
	class="receipt-bottom m-0 ml-auto h-dvh max-h-none w-full max-w-none border-l-2 border-ink bg-paper p-0 backdrop:bg-ink/70 sm:w-[min(100%-2rem,30rem)]"
	aria-labelledby="cart-title"
>
	<div class="flex h-full flex-col">
		<header class="flex items-start justify-between gap-3 border-b-2 border-ink px-4 py-5">
			<div>
				<p class="mono-label text-brand">NOTA PESANAN</p>
				<h2 id="cart-title" class="mt-1 font-display text-2xl font-bold leading-tight tracking-[-0.05em]">
					Pesanan kamu
				</h2>
				<p class="mt-1 font-mono text-xs text-ink/55">{cart.count} item</p>
			</div>
			<button
				type="button"
				class="grid h-10 w-10 shrink-0 place-items-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
				aria-label="Tutup pesanan"
				onclick={() => dialogEl?.close()}
			>
				<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
					<path d="M6 6l12 12M18 6 6 18" />
				</svg>
			</button>
		</header>

		{#if cart.items.length === 0}
			<div class="grid flex-1 place-items-center px-6 text-center">
				<div class="space-y-3">
					<p class="font-display text-lg font-semibold">Pesanan masih kosong</p>
					<p class="text-sm text-ink/65">Pilih {config.labels.items.toLowerCase()} dulu, lalu kembali ke sini.</p>
					<button
						type="button"
						class="print-button-light px-4"
						onclick={() => dialogEl?.close()}
					>
						Lihat menu
					</button>
				</div>
			</div>
		{:else}
			<div class="flex-1 overflow-y-auto px-4">
				<ul class="divide-y divide-dashed divide-ink/25">
					{#each lines as { item, product } (item.productId + '|' + (item.variant ?? ''))}
						<li class="py-3">
							<div class="flex items-start gap-2">
								<div class="min-w-0 flex-1">
									<p class="text-sm font-semibold leading-snug">
										{product.name}{#if item.variant}<span class="font-normal text-ink/60"> ({item.variant})</span>{/if}
									</p>
									<p class="text-xs text-ink/55">
										{item.unitPrice === null ? 'Tanya harga' : formatRupiah(item.unitPrice)}
									</p>
								</div>
								<p class="pt-0.5 font-display text-sm font-semibold tabular">
									{item.unitPrice === null ? 'tanya harga' : formatRupiah(item.unitPrice * item.qty)}
								</p>
								<button
									type="button"
									class="grid h-11 w-11 shrink-0 place-items-center border border-ink/20 text-ink/55 transition hover:bg-ink hover:text-paper"
									aria-label={`Hapus ${product.name} dari pesanan`}
									onclick={() => cart.remove(item.productId, item.variant)}
								>
									<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
										<path d="M6 6l12 12M18 6 6 18" stroke-linecap="round" />
									</svg>
								</button>
							</div>

							<div class="mt-1 flex items-center justify-between">
								<div class="flex items-center rounded-lg border border-ink/15">
									<button
										type="button"
										class="grid h-11 w-11 place-items-center text-ink transition hover:bg-paper-light disabled:opacity-40"
										aria-label={`Kurangi jumlah ${product.name}`}
										disabled={item.qty <= 1}
										onclick={() => cart.decrement(item.productId, item.variant)}
									>
										−
									</button>
									<span class="w-9 text-center text-sm font-semibold tabular" aria-live="polite">
										{item.qty}
									</span>
									<button
										type="button"
										class="grid h-11 w-11 place-items-center text-ink transition hover:bg-paper-light disabled:opacity-40"
										aria-label={`Tambah jumlah ${product.name}`}
										disabled={item.qty >= 99}
										onclick={() => cart.increment(item.productId, item.variant)}
									>
										+
									</button>
								</div>
								<span class="text-xs text-ink/50">{product.unit ?? ''}</span>
							</div>

							{#if config.features.itemNote}
								<label class="mt-2 block">
									<span class="sr-only">Catatan untuk {product.name}</span>
									<input
										type="text"
										maxlength="80"
										placeholder="Catatan (mis. tanpa seledri)"
										class="field h-10 text-xs"
										value={item.note}
										oninput={(event) =>
											cart.setNote(
												item.productId,
												item.variant,
												(event.currentTarget as HTMLInputElement).value
											)}
									/>
								</label>
							{/if}
						</li>
					{/each}
				</ul>

				<div class="border-t border-dashed border-ink/25 py-3">
					<div class="flex items-baseline justify-between gap-3">
						<span class="text-sm font-semibold">
							{cart.hasUnpriced ? 'Total (di luar item tanya harga)' : 'Total'}
						</span>
						<span class="font-display text-lg font-semibold tabular">{formatRupiah(cart.total)}</span>
					</div>
					<div class="mt-1 flex items-center justify-between">
						{#if confirmClear}
							<span class="flex items-center gap-2 text-xs">
								Kosongkan?
								<button
									type="button"
									class="font-semibold underline underline-offset-2"
									onclick={() => {
										cart.clear();
										confirmClear = false;
									}}
								>
									Ya
								</button>
								<button
									type="button"
									class="text-ink/60 underline underline-offset-2"
									onclick={() => (confirmClear = false)}
								>
									Batal
								</button>
							</span>
						{:else}
							<button
								type="button"
								class="min-h-11 text-xs font-medium text-ink/60 underline decoration-ink/25 underline-offset-2 hover:text-ink"
								onclick={() => (confirmClear = true)}
							>
								Kosongkan pesanan
							</button>
						{/if}
					</div>
				</div>

				<div class="space-y-4 border-t border-dashed border-ink/25 py-4">
					<div>
						<label for="buyer-name" class="mb-1.5 block text-sm font-semibold">Nama</label>
						<input
							id="buyer-name"
							type="text"
							autocomplete="name"
							class="field"
							placeholder="Nama kamu"
							value={cart.buyer.name}
							aria-invalid={nameError ? 'true' : undefined}
							aria-describedby={nameError ? 'buyer-name-error' : undefined}
							oninput={(event) =>
								cart.setBuyer('name', (event.currentTarget as HTMLInputElement).value)}
						/>
						{#if nameError}
							<p id="buyer-name-error" class="mt-1 text-xs font-medium text-brand">{nameError}</p>
						{/if}
					</div>

					<fieldset>
						<legend class="mb-1.5 text-sm font-semibold">Cara terima</legend>
						<div class="space-y-2">
							{#if config.fulfillment.dineIn}
								<label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-ink/15 px-3 text-sm">
									<input type="radio" name="fulfillment" value="dine-in" bind:group={mode} class="accent-[var(--brand-primary)]" />
									Makan di tempat
								</label>
							{/if}
							{#if config.fulfillment.pickup}
								<label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-ink/15 px-3 text-sm">
									<input type="radio" name="fulfillment" value="pickup" bind:group={mode} class="accent-[var(--brand-primary)]" />
									Ambil sendiri
								</label>
							{/if}
							{#if config.fulfillment.delivery}
								<label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-ink/15 px-3 text-sm">
									<input type="radio" name="fulfillment" value="delivery" bind:group={mode} class="accent-[var(--brand-primary)]" />
									Antar
								</label>
							{/if}
						</div>
					</fieldset>

					{#if mode === 'dine-in'}
						<div>
							<label for="table-number" class="mb-1.5 block text-sm font-semibold">
								Nomor meja <span class="font-normal text-ink/50">(opsional)</span>
							</label>
							<input
								id="table-number"
								type="text"
								inputmode="numeric"
								class="field"
								placeholder="Mis. 5"
								bind:value={table}
							/>
						</div>
					{:else if mode === 'delivery'}
						<div>
							<label for="buyer-address" class="mb-1.5 block text-sm font-semibold">Alamat antar</label>
							<textarea
								id="buyer-address"
								rows="2"
								class="field-area"
								placeholder="Alamat lengkap, patokan, nomor rumah"
								value={cart.buyer.address}
								aria-invalid={addressError ? 'true' : undefined}
								aria-describedby={addressError ? 'buyer-address-error' : undefined}
								oninput={(event) =>
									cart.setBuyer('address', (event.currentTarget as HTMLTextAreaElement).value)}
							></textarea>
							{#if addressError}
								<p id="buyer-address-error" class="mt-1 text-xs font-medium text-brand">{addressError}</p>
							{/if}
							{#if config.fulfillment.deliveryNote}
								<p class="mt-1 text-xs text-ink/55">{config.fulfillment.deliveryNote}</p>
							{/if}
						</div>
					{/if}

					<div>
						<label for="order-note" class="mb-1.5 block text-sm font-semibold">
							Catatan umum <span class="font-normal text-ink/50">(opsional)</span>
						</label>
						<textarea
							id="order-note"
							rows="2"
							maxlength="200"
							class="field-area"
							placeholder="Mis. sambal dipisah"
							bind:value={note}
						></textarea>
					</div>
				</div>

				<p class="pb-2 text-center font-display text-xs font-medium tracking-wide text-ink/45">
					Terima kasih sudah pesan
				</p>
			</div>

			<footer class="space-y-2 border-t border-dashed border-ink/25 px-4 pb-7 pt-3">
				{#if preview.tooLong}
					<button
						type="button"
						class="inline-flex h-11 w-full items-center justify-center rounded-xl border border-ink/25 px-4 text-sm font-semibold text-ink transition hover:bg-paper-light"
						onclick={copyMessage}
					>
						Salin pesan
					</button>
				{/if}

				<button
					type="button"
					class="wa-button inline-flex h-12 w-full items-center justify-center rounded-xl px-4 text-base font-semibold transition"
					onclick={send}
				>
					{config.labels.sendOrder}
				</button>

				<p class="text-center text-[11px] leading-snug text-ink/55" aria-live="polite">
					{#if copied}
						Pesan disalin.
					{:else if sent}
						WhatsApp dibuka di tab baru. Keranjang tidak dikosongkan.
					{:else}
						Pesan dibuka di WhatsApp. Cek dulu sebelum kirim.
					{/if}
				</p>
			</footer>
		{/if}
	</div>
</dialog>
