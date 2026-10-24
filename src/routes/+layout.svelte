<script lang="ts">
	import '../app.css';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { config } from '$lib/config.js';

	let { children } = $props();

	const brandVars = [
		`--brand-primary:${config.brand.primary}`,
		`--brand-accent:${config.brand.accent}`,
		`--brand-ink:${config.brand.ink}`,
		`--brand-surface:${config.brand.surface}`,
		`--brand-wa:${config.brand.wa}`
	].join(';');
</script>

<div id="top" class="min-h-dvh bg-paper font-sans text-ink" style={brandVars}>
	<SiteHeader />
	{@render children()}
	<SiteFooter />
</div>
