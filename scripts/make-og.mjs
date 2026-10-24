import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { config } from '../src/lib/config.ts';

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT = path.resolve('static/og.jpg');
const PHOTO_CANDIDATES = [
	path.resolve('static/products/bakso-spesial.webp'),
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

function overlay() {
	const name = escapeXml(config.name);
	const tagline = escapeXml(config.tagline);

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
			<text x="${WIDTH - 64}" y="552" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#FFFFFF" fill-opacity="0.7">${escapeXml(config.address)}</text>
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
