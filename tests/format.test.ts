import { describe, expect, it } from 'vitest';
import { config, type BusinessConfig } from '../src/lib/config.js';
import { formatRupiah, isOpenNow, zonedDayAndMinutes } from '../src/lib/format.js';

function withHours(hours: BusinessConfig['hours']): BusinessConfig {
	return { ...config, hours };
}

const allDaysOpen: BusinessConfig['hours'] = {
	0: ['10:00', '21:00'],
	1: ['10:00', '21:00'],
	2: ['10:00', '21:00'],
	3: ['10:00', '21:00'],
	4: ['10:00', '21:00'],
	5: ['10:00', '21:00'],
	6: ['10:00', '21:00']
};

describe('formatRupiah', () => {
	it('memakai format ribuan Indonesia', () => {
		expect(formatRupiah(20000)).toBe('Rp 20.000');
		expect(formatRupiah(0)).toBe('Rp 0');
	});
});

describe('isOpenNow', () => {
	it('menghitung waktu di zona WITA, bukan jam perangkat', () => {
		const sabtuPagi = new Date('2026-10-24T02:00:00Z');
		const zoned = zonedDayAndMinutes('Asia/Makassar', sabtuPagi);

		expect(zoned.day).toBe(6);
		expect(zoned.minutes).toBe(10 * 60);
	});

	it('buka tepat pada jam buka dan tutup tepat pada jam tutup', () => {
		const cfg = withHours(allDaysOpen);

		expect(isOpenNow(cfg, new Date('2026-10-24T02:00:00Z'))).toBe(true);
		expect(isOpenNow(cfg, new Date('2026-10-24T01:59:00Z'))).toBe(false);
		expect(isOpenNow(cfg, new Date('2026-10-24T12:59:00Z'))).toBe(true);
		expect(isOpenNow(cfg, new Date('2026-10-24T13:00:00Z'))).toBe(false);
	});

	it('menutup toko saat hari libur (null)', () => {
		const cfg = withHours({ ...allDaysOpen, 6: null });

		expect(isOpenNow(cfg, new Date('2026-10-24T02:30:00Z'))).toBe(false);
	});

	it('mendukung jam lewat tengah malam', () => {
		const overnight = Object.fromEntries(
			Object.keys(allDaysOpen).map((day) => [day, ['20:00', '02:00']])
		) as BusinessConfig['hours'];
		const cfg = withHours(overnight);

		expect(isOpenNow(cfg, new Date('2026-10-24T12:00:00Z'))).toBe(true);
		expect(isOpenNow(cfg, new Date('2026-10-24T17:59:00Z'))).toBe(true);
		expect(isOpenNow(cfg, new Date('2026-10-24T18:00:00Z'))).toBe(false);
		expect(isOpenNow(cfg, new Date('2026-10-24T11:59:00Z'))).toBe(false);
	});
});
