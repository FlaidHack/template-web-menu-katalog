import { describe, expect, it } from 'vitest';
import { config, type BusinessConfig } from '../src/lib/config.js';
import {
	buildOrderMessage,
	buildWaUrl,
	isUrlTooLong,
	type OrderLine
} from '../src/lib/whatsapp.js';

function withFeatures(itemNote: boolean): BusinessConfig {
	return {
		...config,
		features: { ...config.features, itemNote }
	};
}

const lines: OrderLine[] = [
	{ name: 'Bakso Spesial', variant: 'Jumbo', qty: 2, unitPrice: 25000 },
	{ name: 'Es Teh', qty: 2, unitPrice: 5000 },
	{ name: 'Nasi Kotak', qty: 1, unitPrice: null }
];

describe('buildOrderMessage', () => {
	it('menolak keranjang kosong', () => {
		expect(() =>
			buildOrderMessage({
				lines: [],
				customerName: 'Budi',
				fulfillment: { mode: 'pickup' }
			})
		).toThrow(/kosong/i);
	});

	it('menyusun nomor urut, jumlah, subtotal, dan total', () => {
		const message = buildOrderMessage({
			lines,
			customerName: 'Budi',
			fulfillment: { mode: 'dine-in', table: '5' },
			note: 'Sambal dipisah'
		});

		expect(message).toContain(`Halo ${config.name}, saya mau pesan:`);
		expect(message).toContain('1. Bakso Spesial (Jumbo) x2 = Rp 50.000');
		expect(message).toContain('2. Es Teh x2 = Rp 10.000');
		expect(message).toContain('Total: Rp 60.000 (belum termasuk item tanya harga)');
		expect(message).toContain('Nama: Budi');
		expect(message).toContain('Makan di tempat (meja 5)');
		expect(message).toContain('Catatan: Sambal dipisah');
	});

	it('menulis item tanpa harga sebagai "tanya harga" dan menandai total', () => {
		const message = buildOrderMessage({
			lines: [{ name: 'Nasi Kotak', qty: 3, unitPrice: null }],
			customerName: 'Budi',
			fulfillment: { mode: 'pickup' }
		});

		expect(message).toContain('1. Nasi Kotak x3 = tanya harga');
		expect(message).toContain('Total: Rp 0 (belum termasuk item tanya harga)');
	});

	it('menampilkan varian di nama item', () => {
		const message = buildOrderMessage({
			lines: [{ name: 'Bakso Spesial', variant: 'Jumbo', qty: 1, unitPrice: 35000 }],
			customerName: 'Budi',
			fulfillment: { mode: 'pickup' }
		});

		expect(message).toContain('Bakso Spesial (Jumbo) x1 = Rp 35.000');
	});

	it('menampilkan catatan per item dan menghormati features.itemNote', () => {
		const withNote: OrderLine[] = [
			{ name: 'Bakso Spesial', qty: 1, unitPrice: 25000, note: 'tanpa seledri' }
		];

		const shown = buildOrderMessage(
			{ lines: withNote, customerName: 'Budi', fulfillment: { mode: 'pickup' } },
			withFeatures(true)
		);
		const hidden = buildOrderMessage(
			{ lines: withNote, customerName: 'Budi', fulfillment: { mode: 'pickup' } },
			withFeatures(false)
		);

		expect(shown).toContain('   Catatan: tanpa seledri');
		expect(hidden).not.toContain('tanpa seledri');
	});

	it('menambahkan nomor meja hanya bila diisi', () => {
		const withTable = buildOrderMessage({
			lines: [{ name: 'Es Teh', qty: 1, unitPrice: 5000 }],
			customerName: 'Budi',
			fulfillment: { mode: 'dine-in', table: '12' }
		});
		const noTable = buildOrderMessage({
			lines: [{ name: 'Es Teh', qty: 1, unitPrice: 5000 }],
			customerName: 'Budi',
			fulfillment: { mode: 'dine-in' }
		});

		expect(withTable).toContain('Makan di tempat (meja 12)');
		expect(noTable).toMatch(/\nMakan di tempat$/);
		expect(noTable).not.toContain('meja');
	});

	it('menulis alamat untuk antar dan tidak menambah apa pun untuk ambil sendiri', () => {
		const delivery = buildOrderMessage({
			lines: [{ name: 'Es Teh', qty: 1, unitPrice: 5000 }],
			customerName: 'Budi',
			fulfillment: { mode: 'delivery', address: 'Jl. Mawar 3' }
		});
		const pickup = buildOrderMessage({
			lines: [{ name: 'Es Teh', qty: 1, unitPrice: 5000 }],
			customerName: 'Budi',
			fulfillment: { mode: 'pickup' }
		});

		expect(delivery).toContain('Antar ke: Jl. Mawar 3');
		expect(pickup).toContain('Ambil sendiri');
		expect(pickup).not.toContain('Antar ke:');
	});
});

describe('buildWaUrl', () => {
	it('meng-encode karakter spesial dan baris baru', () => {
		const message = 'Halo & pesan #1 🍜\nBaris dua';
		const url = buildWaUrl('+62 857-5342-1213', message);

		expect(url.startsWith('https://wa.me/6285753421213?text=')).toBe(true);
		expect(url).toContain('%26');
		expect(url).toContain('%23');
		expect(url).toContain('%F0%9F%8D%9C');
		expect(url).toContain('%0A');
		expect(url).not.toContain(' ');
	});

	it('menandai URL panjang untuk mode salin pesan', () => {
		const longLines: OrderLine[] = Array.from({ length: 60 }, (_, index) => ({
			name: `Menu panjang nomor ${index + 1} dengan nama yang sengaja dibuat panjang`,
			qty: 2,
			unitPrice: 25000,
			note: 'catatan tambahan yang juga panjang'
		}));

		const message = buildOrderMessage({
			lines: longLines,
			customerName: 'Budi',
			fulfillment: { mode: 'delivery', address: config.address }
		});
		const url = buildWaUrl(config.whatsapp, message);

		expect(url.length).toBeGreaterThan(1900);
		expect(isUrlTooLong(url)).toBe(true);
	});

	it('tidak menandai URL pendek', () => {
		const url = buildWaUrl(config.whatsapp, 'Halo, saya mau tanya soal menu.');
		expect(isUrlTooLong(url)).toBe(false);
	});
});
