export interface IProduct {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  images: string[];
  discount: number;
  inStock: boolean;
  isActive: boolean;
  popularityScore: number;
  soldCount: number;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}
