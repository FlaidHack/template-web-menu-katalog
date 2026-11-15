<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { config } from '$lib/config.js';

	const navItems = [
		{ href: '/', label: 'Beranda' },
		{ href: '/menu', label: 'Menu' },
		{ href: '/lokasi', label: 'Kunjungi' }
	];

	let navHidden = $state(false);

	onMount(() => {
		let lastY = window.scrollY;

		const onScroll = () => {
			const y = window.scrollY;

			if (y < 96) {
				navHidden = false;
			} else if (y > lastY + 8) {
				navHidden = true;
			} else if (y < lastY - 8) {
				navHidden = false;
			}

			lastY = y;
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<header
	class="sticky top-0 z-50 border-b border-ink/20 bg-paper px-4 transition-transform duration-300 ease-out focus-within:translate-y-0 {navHidden
		? '-translate-y-full'
		: 'translate-y-0'}"
>
	<div class="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 py-3">
		<a href="/" class="flex min-w-0 items-center gap-2.5" aria-label="{config.name}, beranda">
			<span class="h-3 w-3 shrink-0 bg-brand"></span>
			<span class="truncate font-display text-sm font-bold tracking-[-0.03em] sm:text-base">{config.name}</span>
		</a>

		<nav aria-label="Navigasi utama" class="flex items-center gap-4 text-sm sm:gap-6">
			{#each navItems as item (item.href)}
				<a
					href={item.href}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
					class="{item.label === 'Beranda' ? 'hidden sm:inline' : ''} border-b-2 py-2 font-semibold transition-colors {page.url.pathname === item.href
						? 'border-brand text-ink'
						: 'border-transparent text-ink/65 hover:border-ink/45 hover:text-ink'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
