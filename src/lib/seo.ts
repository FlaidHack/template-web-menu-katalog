import { config } from './config.js';

const SCHEMA_DAYS = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];

export function buildJsonLd(): Record<string, unknown> {
	const openingHours = Object.entries(config.hours)
		.filter((entry): entry is [string, [string, string]] => entry[1] !== null)
		.map(([day, range]) => ({
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: SCHEMA_DAYS[Number(day)],
			opens: range[0],
			closes: range[1]
		}));

	const data: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': config.schemaType,
		name: config.name,
		description: config.description,
		url: config.siteUrl,
		image: `${config.siteUrl}/og.jpg`,
		telephone: `+${config.whatsapp}`,
		address: {
			'@type': 'PostalAddress',
			streetAddress: config.address,
			addressCountry: 'ID'
		},
		openingHoursSpecification: openingHours
	};

	if (config.schemaType === 'Restaurant') {
		data.servesCuisine = 'Indonesia';
		data.priceRange = 'Rp';
	}

	return data;
}

export function buildJsonLdScript(): string {
	const json = JSON.stringify(buildJsonLd()).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
