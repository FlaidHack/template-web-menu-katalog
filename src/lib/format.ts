import { config, type BusinessConfig, type DayHours } from './config.js';

const rupiah = new Intl.NumberFormat('id-ID', {
	maximumFractionDigits: 0
});

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const WEEKDAY_INDEX: Record<string, number> = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6
};

export function formatRupiah(value: number): string {
	return `Rp ${rupiah.format(value)}`;
}

export function formatHours(range: DayHours): string {
	if (!range) return 'Tutup';
	return `${range[0].replace(':', '.')}–${range[1].replace(':', '.')}`;
}

export function toMinutes(time: string): number {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
}

export function zonedDayAndMinutes(
	timezone: string,
	now: Date = new Date()
): { day: number; minutes: number } {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(now);

	const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
	const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0') % 24;
	const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

	return {
		day: WEEKDAY_INDEX[weekday] ?? 0,
		minutes: hour * 60 + minute
	};
}

export function isOpenNow(cfg: BusinessConfig = config, now: Date = new Date()): boolean {
	const { day, minutes } = zonedDayAndMinutes(cfg.timezone, now);
	const range = cfg.hours[day];

	if (!range) return false;

	const open = toMinutes(range[0]);
	const close = toMinutes(range[1]);

	if (close <= open) {
		return minutes >= open || minutes < close;
	}

	return minutes >= open && minutes < close;
}
