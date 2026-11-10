export type Category = { id: string; slug: string; label: string; image: string };

export type ProductOption = { label: string; values: string[] };

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  oldPrice?: number;
  images: string[];
  badge?: { label: string; tone?: 'lime' | 'dark' | 'sale' | 'light' };
  description: string;
  options: ProductOption[];
  sku?: string;
  featured?: boolean;
  isNew?: boolean;
  inStock: boolean;
};

export type CatalogQuery = {
  brands: string[];
  onSale: boolean;
  isNew: boolean;
  min?: number;
  max?: number;
  sort: 'relevancia' | 'menor-preco' | 'maior-preco';
  page: number;
};
