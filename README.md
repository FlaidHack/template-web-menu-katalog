# Katalog WA Demo

Template web katalog menu statis untuk UMKM kuliner. Pelanggan pilih menu, tambah ke nota, lalu pesan langsung lewat WhatsApp. Dibangun dengan **SvelteKit 2 + Svelte 5 runes + Tailwind 4**, prerender statis, tanpa database / autentikasi / admin panel.

## Struktur

```
src/
  routes/
    +page.svelte        # Landing page (cerita, tidak menampilkan daftar menu penuh)
    +layout.svelte      # Header + footer global
    menu/
      +page.svelte      # Halaman katalog sendiri + nota pesanan
  lib/
    config.ts           # Satu-satunya sumber data klien (nama, WA, jam, warna, dll.)
    data/products.json  # Data produk dummy
    format.ts           # formatRupiah, isOpenNow, formatHours, zonasi WITA
    whatsapp.ts         # buildOrderMessage, buildWaUrl, batas 1900 karakter
    catalog.ts          # filter/search/stok
    cart.svelte.ts      # Stateful cart singleton + localStorage
    seo.ts              # JSON-LD Restaurant
    components/         # SiteHeader, SiteFooter, MenuRow, ProductSheet, CartDrawer, StoreInfo
  app.css               # Design system (warna, font, tekstur, komponen dasar)
static/
  landing.jpg, banner.jpg, og.jpg, favicon.svg, products/*.jpg
scripts/
  optimize-images.mjs   # resize + kompres foto produk
  make-og.mjs           # generate og.jpg
```

## Jalankan lokal

```bash
npm install          # jalankan sekali
npm run dev          # development (localhost:5173)
npm run build        # build produksi ke folder build/
npm run preview      # preview build produksi
npm run check        # TypeScript + Svelte check
npm run test         # vitest
```

## Ganti milik klien

Edit satu file: `src/lib/config.ts` (nama, tagline, WA, alamat, jam buka, warna brand, kredit).

## Ganti foto

1. Taruh foto asli di `raw-images/` (nama bebas).
2. Jalankan `npm run images` → foto produk dikompres ke `static/products/`.
3. Update `image` di `src/lib/data/products.json` agar path cocok.
4. Ganti `static/landing.jpg` (hero landing) dan `static/banner.jpg` (atas `/menu`).
5. Jalankan `npm run og` → regenerasi `static/og.jpg` untuk preview media sosial.

## Tambah / ubah produk

Edit `src/lib/data/products.json`. Setiap produk butuh `id`, `name`, `category`, `price` (boleh `null` untuk "tanya harga"), `unit`, `description`. Opsional: `image`, `variants[]`, `stock` (`habis` / `terbatas`), `popular`.

## Preset usaha lain

Template ini sengaja generik. Untuk **toko bangunan / non-kuliner**, cukup ganti:
- `config.ts`: nama, alamat, WA, jam, warna brand, label cart/items
- `products.json`: kategori dan item sesuai stok toko
- Copy teks landing (`+page.svelte`) agar tidak bernuansa kuliner

## Deploy

Hasil `npm run build` ada di folder `build/` (statis). Bisa diunggah ke **Cloudflare Pages**, Netlify, Vercel (static), GitHub Pages, atau hosting Apache/Nginx biasa.

```
npm run build   # output: build/
```

## Catatan desain

- Tidak ada badge "Terlaris"/"Baru", chip kategori melingkar, tombol floating WA, atau kartu rounded bershadow (hindari tampilan "AI slop").
- Estetika kertas cetak, tipografi besar, border tepi 2px, nota pesanan seperti struk.
- Semua font self-host (tidak ada request domain luar kecuali WhatsApp & Google Maps pilihan pelanggan).

## Kredit

Dibuat oleh Flaid — https://flaid.my.id
