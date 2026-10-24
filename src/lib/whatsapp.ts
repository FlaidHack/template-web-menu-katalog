import { config, type BusinessConfig } from './config.js';
import { formatRupiah } from './format.js';

export const MAX_WA_URL_LENGTH = 1900;

export type OrderLine = {
	name: string;
	variant?: string | null;
	qty: number;
	unitPrice: number | null;
	note?: string;
};

export type Fulfillment =
	| { mode: 'dine-in'; table?: string }
	| { mode: 'pickup' }
	| { mode: 'delivery'; address: string };

export type OrderInput = {
	lines: OrderLine[];
	customerName: string;
	fulfillment: Fulfillment;
	note?: string;
};

function fulfillmentLine(fulfillment: Fulfillment): string {
	if (fulfillment.mode === 'dine-in') {
		const table = fulfillment.table?.trim();
		return table ? `Makan di tempat (meja ${table})` : 'Makan di tempat';
	}

	if (fulfillment.mode === 'delivery') {
		return `Antar ke: ${fulfillment.address.trim()}`;
	}

	return 'Ambil sendiri';
}

export function buildOrderMessage(input: OrderInput, cfg: BusinessConfig = config): string {
	if (input.lines.length === 0) {
		throw new Error('Keranjang masih kosong.');
	}

	let total = 0;
	let hasUnpriced = false;

	const items = input.lines.map((line, index) => {
		const variant = line.variant ? ` (${line.variant})` : '';
		let price: string;

		if (line.unitPrice === null) {
			hasUnpriced = true;
			price = 'tanya harga';
		} else {
			total += line.unitPrice * line.qty;
			price = formatRupiah(line.unitPrice * line.qty);
		}

		let row = `${index + 1}. ${line.name}${variant} x${line.qty} = ${price}`;

		if (cfg.features.itemNote && line.note?.trim()) {
			row += `\n   Catatan: ${line.note.trim()}`;
		}

		return row;
	});

	const totalLine = hasUnpriced
		? `Total: ${formatRupiah(total)} (belum termasuk item tanya harga)`
		: `Total: ${formatRupiah(total)}`;

	const rows = [
		`Halo ${cfg.name}, saya mau pesan:`,
		'',
		...items,
		'',
		totalLine,
		`Nama: ${input.customerName.trim()}`,
		fulfillmentLine(input.fulfillment)
	];

	const note = input.note?.trim();
	if (note) {
		rows.push(`Catatan: ${note}`);
	}

	return rows.join('\n');
}

export function normalizePhone(phone: string): string {
	return phone.replace(/\D/g, '');
}

export function buildWaUrl(phone: string, message: string): string {
	return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function isUrlTooLong(url: string, limit = MAX_WA_URL_LENGTH): boolean {
	return url.length > limit;
}
