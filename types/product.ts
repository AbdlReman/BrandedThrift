export interface IProduct {
  _id: string;
  name: string;
  brand: "PUMA" | "NIKE" | "ADIDAS" | "NEW BALANCE" | "REEBOK";
  category: "Running" | "Lifestyle" | "Training";
  price: number;
  originalPrice: number;
  color: string;
  shortDescription: string;
  longDescription: string;
  images: string[];
  inStock: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
