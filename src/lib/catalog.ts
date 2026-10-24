import type { BusinessConfig } from './config.js';
import type { Product } from './types.js';

export const ALL_CATEGORY = 'Semua';

export function normalizeQuery(value: string): string {
	return value
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

export function matchesQuery(product: Product, normalizedQuery: string): boolean {
	if (!normalizedQuery) return true;

	const haystack = normalizeQuery(
		[product.name, product.category, product.description ?? ''].join(' ')
	);

	return haystack.includes(normalizedQuery);
}

export function filterProducts(
	products: Product[],
	query: string,
	category: string = ALL_CATEGORY
): Product[] {
	const normalizedQuery = normalizeQuery(query);

	return products
		.map((product, index) => ({ product, index }))
		.filter(({ product }) => {
			const categoryMatches = category === ALL_CATEGORY || product.category === category;
			return categoryMatches && matchesQuery(product, normalizedQuery);
		})
		.sort((a, b) => {
			const popularA = a.product.popular ? 0 : 1;
			const popularB = b.product.popular ? 0 : 1;
			return popularA - popularB || a.index - b.index;
		})
		.map(({ product }) => product);
}

export function variantPrice(product: Product, variantLabel: string | null): number | null {
	if (!variantLabel) return product.price;

	const variant = product.variants?.find((item) => item.label === variantLabel);
	return variant ? variant.price : product.price;
}

export function stockLabel(product: Product): string | null {
	if (product.stock === 'habis') return 'Habis';
	if (product.stock === 'terbatas') return 'Stok terbatas';
	return null;
}

export function badgeFor(product: Product, cfg: BusinessConfig): string | null {
	if (!cfg.features.badges) return null;
	return product.badge ?? null;
}

export function showStockHint(cfg: BusinessConfig, product: Product): boolean {
	return cfg.features.showStockHint && Boolean(product.stock);
}

export function isSoldOut(product: Product): boolean {
	return product.stock === 'habis';
}

export function addActionLabel(product: Product, cfg: BusinessConfig): string {
	return isSoldOut(product) ? 'Habis' : cfg.labels.addToCart;
}

export function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase() ?? '')
		.join('');
}
