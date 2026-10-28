import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { config } from '../src/lib/config.ts';

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT = path.resolve('static/og.jpg');
const PHOTO_CANDIDATES = [
	path.resolve('static/products/bakso.jpg'),
	path.resolve('static/products/sate.jpg'),
	path.resolve('static/products/placeholder.svg')
];

function escapeXml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

async function findPhoto() {
	for (const candidate of PHOTO_CANDIDATES) {
		try {
			await access(candidate);
			return candidate;
		} catch {
			// lanjut ke kandidat berikutnya
		}
	}

	return null;
}

function wrapAddress(value, maxChars = 56) {
	const parts = value
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	const lines = [];
	let line = '';

	for (const part of parts) {
		const next = line ? `${line}, ${part}` : part;

		if (next.length > maxChars && line) {
			lines.push(line);
			line = part;
		} else {
			line = next;
		}
	}

	if (line) lines.push(line);
	return lines.length > 1 ? [lines[0], lines.slice(1).join(', ')] : lines;
}

function overlay() {
	const name = escapeXml(config.name);
	const tagline = escapeXml(config.tagline);
	const addressLines = wrapAddress(config.address);
	const addressY = addressLines.length > 1 ? 524 : 548;
	const address = addressLines
		.map(
			(line, index) =>
				`<text x="${WIDTH - 64}" y="${addressY + index * 24}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#FFFFFF" fill-opacity="0.7">${escapeXml(line)}</text>`
		)
		.join('');

	return Buffer.from(`
		<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
			<defs>
				<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="${config.brand.ink}" stop-opacity="0.18" />
					<stop offset="62%" stop-color="${config.brand.ink}" stop-opacity="0.72" />
					<stop offset="100%" stop-color="${config.brand.ink}" stop-opacity="0.92" />
				</linearGradient>
			</defs>
			<rect width="${WIDTH}" height="${HEIGHT}" fill="${config.brand.ink}" fill-opacity="0.35" />
			<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)" />
			<rect x="64" y="72" width="52" height="8" rx="4" fill="${config.brand.accent}" />
			<text x="64" y="168" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="700" fill="#FFFFFF">${name}</text>
			<text x="64" y="232" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#FFFFFF" fill-opacity="0.82">${tagline}</text>
			<text x="64" y="548" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF">${escapeXml(config.labels.sendOrder)}</text>
			${address}
		</svg>
	`);
}

async function main() {
	await mkdir(path.dirname(OUTPUT), { recursive: true });

	const photo = await findPhoto();
	const base = photo
		? sharp(photo).resize({ width: WIDTH, height: HEIGHT, fit: 'cover', position: 'centre' })
		: sharp({
				create: {
					width: WIDTH,
					height: HEIGHT,
					channels: 3,
					background: config.brand.ink
				}
			});

	await base
		.composite([{ input: overlay(), top: 0, left: 0 }])
		.jpeg({ quality: 82, mozjpeg: true })
		.toFile(OUTPUT);

	console.log(`✓ static/og.jpg (${WIDTH}x${HEIGHT})`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
