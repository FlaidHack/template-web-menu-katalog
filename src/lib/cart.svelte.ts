import { browser } from '$app/environment';
import { variantPrice } from './catalog.js';
import type { Product } from './types.js';

export type CartItem = {
	productId: string;
	variant: string | null;
	qty: number;
	note: string;
	unitPrice: number | null;
};

export type Buyer = {
	name: string;
	address: string;
};

const CART_KEY = 'katalog-wa.cart.v1';
const BUYER_KEY = 'katalog-wa.buyer.v1';
const MAX_NOTE_LENGTH = 80;

function readJson<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function writeJson(key: string, value: unknown): void {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Storage bisa diblokir (mode privat, kuota penuh). Keranjang tetap jalan di memori.
	}
}

function sameLine(item: CartItem, productId: string, variant: string | null): boolean {
	return item.productId === productId && item.variant === variant;
}

class CartStore {
	items = $state<CartItem[]>([]);
	buyer = $state<Buyer>({ name: '', address: '' });
	loaded = $state(false);

	get count(): number {
		return this.items.reduce((total, item) => total + item.qty, 0);
	}

	get isEmpty(): boolean {
		return this.items.length === 0;
	}

	get hasUnpriced(): boolean {
		return this.items.some((item) => item.unitPrice === null);
	}

	lineTotal(item: CartItem): number {
		return (item.unitPrice ?? 0) * item.qty;
	}

	get total(): number {
		return this.items.reduce((sum, item) => sum + this.lineTotal(item), 0);
	}

	load(): void {
		if (this.loaded || !browser) return;

		const stored = readJson<CartItem[]>(CART_KEY, []);
		this.items = Array.isArray(stored)
			? stored
					.filter(
						(item) =>
							typeof item?.productId === 'string' &&
							typeof item.qty === 'number' &&
							item.qty > 0
					)
					.map((item) => ({
						productId: item.productId,
						variant: typeof item.variant === 'string' ? item.variant : null,
						qty: Math.min(item.qty, 99),
						note: typeof item.note === 'string' ? item.note.slice(0, MAX_NOTE_LENGTH) : '',
						unitPrice:
							typeof item.unitPrice === 'number' || item.unitPrice === null
								? item.unitPrice
								: null
					}))
			: [];

		const buyer = readJson<Buyer>(BUYER_KEY, { name: '', address: '' });
		this.buyer = {
			name: typeof buyer.name === 'string' ? buyer.name : '',
			address: typeof buyer.address === 'string' ? buyer.address : ''
		};

		this.loaded = true;
	}

	persist(): void {
		writeJson(CART_KEY, this.items);
	}

	persistBuyer(): void {
		writeJson(BUYER_KEY, this.buyer);
	}

	add(product: Product, variant: string | null, qty = 1): void {
		const existing = this.items.find((item) => sameLine(item, product.id, variant));

		if (existing) {
			existing.qty = Math.min(existing.qty + qty, 99);
		} else {
			this.items.push({
				productId: product.id,
				variant,
				qty: Math.min(qty, 99),
				note: '',
				unitPrice: variantPrice(product, variant)
			});
		}

		this.persist();
	}

	setQty(productId: string, variant: string | null, qty: number): void {
		const item = this.items.find((line) => sameLine(line, productId, variant));
		if (!item) return;

		if (qty <= 0) {
			this.remove(productId, variant);
			return;
		}

		item.qty = Math.min(qty, 99);
		this.persist();
	}

	increment(productId: string, variant: string | null): void {
		const item = this.items.find((line) => sameLine(line, productId, variant));
		if (item) this.setQty(productId, variant, item.qty + 1);
	}

	decrement(productId: string, variant: string | null): void {
		const item = this.items.find((line) => sameLine(line, productId, variant));
		if (item) this.setQty(productId, variant, item.qty - 1);
	}

	setNote(productId: string, variant: string | null, note: string): void {
		const item = this.items.find((line) => sameLine(line, productId, variant));
		if (!item) return;

		item.note = note.slice(0, MAX_NOTE_LENGTH);
		this.persist();
	}

	remove(productId: string, variant: string | null): void {
		this.items = this.items.filter((item) => !sameLine(item, productId, variant));
		this.persist();
	}

	clear(): void {
		this.items = [];
		this.persist();
	}

	setBuyer(field: keyof Buyer, value: string): void {
		this.buyer[field] = value;
		this.persistBuyer();
	}
}

export const cart = new CartStore();
