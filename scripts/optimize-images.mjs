import { access, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const RAW_DIR = path.resolve('raw-images');
const OUT_DIR = path.resolve('static/products');
const MAX_WIDTH = 800;
const QUALITY = 78;
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

async function main() {
	try {
		await access(RAW_DIR);
	} catch {
		console.log('Folder raw-images/ belum ada. Taruh foto asli di sana lalu jalankan lagi.');
		return;
	}

	await mkdir(OUT_DIR, { recursive: true });

	const entries = await readdir(RAW_DIR, { withFileTypes: true });
	const files = entries.filter(
		(entry) => entry.isFile() && SUPPORTED.has(path.extname(entry.name).toLowerCase())
	);

	if (files.length === 0) {
		console.log('Tidak ada gambar di raw-images/. Tambahkan .jpg, .png, atau .webp.');
		return;
	}

	for (const file of files) {
		const input = path.join(RAW_DIR, file.name);
		const outputName = `${path.basename(file.name, path.extname(file.name))}.webp`;
		const output = path.join(OUT_DIR, outputName);

		const image = sharp(input).rotate();
		const metadata = await image.metadata();
		const width = Math.min(MAX_WIDTH, metadata.width ?? MAX_WIDTH);

		await image
			.resize({ width, withoutEnlargement: true })
			.webp({ quality: QUALITY })
			.toFile(output);

		console.log(`✓ ${path.relative(process.cwd(), output)} (${width}px, q${QUALITY})`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
