export type StockStatus = 'habis' | 'terbatas';

export type ProductVariant = {
	label: string;
	price: number | null;
};

export type Product = {
	id: string;
	name: string;
	category: string;
	price: number | null;
	unit?: string;
	image?: string;
	description?: string;
	stock?: StockStatus;
	variants?: ProductVariant[];
	badge?: 'Terlaris' | 'Baru';
	popular?: boolean;
};

export type ProductCatalog = {
	categories: string[];
	products: Product[];
};
