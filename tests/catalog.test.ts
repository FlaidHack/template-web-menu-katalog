import { describe, expect, it } from 'vitest';
import catalogData from '../src/lib/data/products.json';
import {
	addActionLabel,
	badgeFor,
	filterProducts,
	normalizeQuery,
	showStockHint,
	stockLabel,
	variantPrice
} from '../src/lib/catalog.js';
import { config, type BusinessConfig } from '../src/lib/config.js';
import type { Product } from '../src/lib/types.js';

const products = catalogData.products as Product[];

function withConfig(patch: Partial<BusinessConfig>): BusinessConfig {
	return { ...config, ...patch };
}

function productById(id: string): Product {
	const product = products.find((item) => item.id === id);
	if (!product) throw new Error(`Produk ${id} tidak ada`);
	return product;
}

describe('filterProducts', () => {
	it('mengabaikan huruf besar dan spasi berlebih', () => {
		expect(normalizeQuery('  Nasi   GORENG  ')).toBe('nasi goreng');

		const result = filterProducts(products, '  NASI   GORENG ');
		expect(result.map((product) => product.id)).toContain('nasi-goreng-kampung');
	});

	it('memfilter berdasarkan kategori', () => {
		const result = filterProducts(products, '', 'Minuman');
		expect(result).toHaveLength(4);
		expect(result.every((product) => product.category === 'Minuman')).toBe(true);
	});

	it('menaruh item populer di atas', () => {
		const result = filterProducts(products, 'paket');
		expect(result[0]?.id).toBe('paket-hemat');
	});

	it('mengembalikan hasil kosong saat kata kunci tidak ada', () => {
		expect(filterProducts(products, 'sushi')).toHaveLength(0);
	});
});

describe('variantPrice', () => {
	it('memakai harga varian yang dipilih', () => {
		const bakso = productById('bakso-spesial');
		expect(variantPrice(bakso, 'Jumbo')).toBe(35000);
		expect(variantPrice(bakso, 'Biasa')).toBe(25000);
		expect(variantPrice(bakso, null)).toBe(25000);
	});

	it('mendukung harga null untuk item tanya harga', () => {
		expect(variantPrice(productById('nasi-kotak'), null)).toBeNull();
	});
});

describe('flag tampilan dari config', () => {
	it('badges hanya tampil saat features.badges aktif', () => {
		const bakso = productById('bakso-spesial');

		expect(badgeFor(bakso, withConfig({ features: { ...config.features, badges: true } }))).toBe(
			'Terlaris'
		);
		expect(badgeFor(bakso, withConfig({ features: { ...config.features, badges: false } }))).toBeNull();
	});

	it('showStockHint hanya tampil untuk item yang punya status stok', () => {
		const cendol = productById('es-cendol');
		const bakso = productById('bakso-spesial');

		expect(showStockHint(withConfig({ features: { ...config.features, showStockHint: false } }), cendol)).toBe(false);
		expect(showStockHint(withConfig({ features: { ...config.features, showStockHint: true } }), cendol)).toBe(true);
		expect(showStockHint(withConfig({ features: { ...config.features, showStockHint: true } }), bakso)).toBe(false);
	});

	it('label stok mengikuti data produk', () => {
		expect(stockLabel(productById('pisang-goreng'))).toBe('Habis');
		expect(stockLabel(productById('es-cendol'))).toBe('Stok terbatas');
		expect(stockLabel(productById('es-teh'))).toBeNull();
	});

	it('label aksi mengikuti labels di config', () => {
		const esTeh = productById('es-teh');
		const pisang = productById('pisang-goreng');

		expect(addActionLabel(esTeh, config)).toBe('Tambah');
		expect(
			addActionLabel(
				esTeh,
				withConfig({ labels: { ...config.labels, addToCart: 'Masukkan keranjang' } })
			)
		).toBe('Masukkan keranjang');
		expect(addActionLabel(pisang, config)).toBe('Habis');
	});
});
