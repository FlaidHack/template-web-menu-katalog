export type DayHours = [string, string] | null;

export type FulfillmentConfig = {
	dineIn: boolean;
	pickup: boolean;
	delivery: boolean;
	deliveryNote?: string;
};

export type LabelsConfig = {
	items: string;
	cart: string;
	addToCart: string;
	sendOrder: string;
};

export type FeaturesConfig = {
	itemNote: boolean;
	showStockHint: boolean;
	badges: boolean;
	displayMode: 'ringkas' | 'foto';
};

export type BrandConfig = {
	primary: string;
	accent: string;
	ink: string;
	surface: string;
	wa: string;
};

export type SchemaType = 'Restaurant' | 'LocalBusiness';

export type BusinessConfig = {
	name: string;
	tagline: string;
	description: string;
	whatsapp: string;
	address: string;
	mapsUrl: string;
	timezone: string;
	hours: Record<number, DayHours>;
	fulfillment: FulfillmentConfig;
	labels: LabelsConfig;
	features: FeaturesConfig;
	brand: BrandConfig;
	siteUrl: string;
	schemaType: SchemaType;
	credit: {
		label: string;
		url: string;
	};
};

export const config: BusinessConfig = {
	name: 'Rumah Makan Citarasa',
	tagline: 'Masakan rumahan, pesan dari HP',
	description:
		'Bakso, mie ayam, soto, dan camilan rumahan di Loa Janan, Samarinda. Pilih menu, pesan langsung lewat WhatsApp.',
	whatsapp: '6281234567890',
	address: 'Jl. Contoh No. 1, Loa Janan, Samarinda',
	mapsUrl: 'https://maps.google.com/?q=Warung+Contoh+Rasa+Loa+Janan+Samarinda',
	timezone: 'Asia/Makassar',
	hours: {
		0: ['10:00', '21:00'],
		1: ['10:00', '21:00'],
		2: ['10:00', '21:00'],
		3: ['10:00', '21:00'],
		4: ['10:00', '21:00'],
		5: ['10:00', '21:00'],
		6: ['10:00', '21:00']
	},
	fulfillment: {
		dineIn: true,
		pickup: true,
		delivery: true,
		deliveryNote: 'Ongkir dikonfirmasi via chat'
	},
	labels: {
		items: 'Menu',
		cart: 'Pesanan',
		addToCart: 'Tambah',
		sendOrder: 'Pesan via WhatsApp'
	},
	features: {
		itemNote: true,
		showStockHint: false,
		badges: false,
		displayMode: 'ringkas' as 'ringkas' | 'foto'
	},
	brand: {
		primary: '#B13B24',
		accent: '#D9A441',
		ink: '#1C1713',
		surface: '#EFE5D4',
		wa: '#1F7A4D'
	},
	siteUrl: 'https://contoh.my.id',
	schemaType: 'Restaurant',
	credit: {
		label: 'Dibuat oleh Flaid',
		url: 'https://flaid.my.id'
	}
};
