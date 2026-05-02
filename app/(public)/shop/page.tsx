import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import type { IProduct } from "@/types/product";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  await connectDB();
  const raw = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  const products: IProduct[] = (raw as Record<string, unknown>[]).map((p) => {
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    const colors = Array.isArray(p.colors) ? (p.colors as string[]) : [];
    const colorVariants = Array.isArray(p.colorVariants)
      ? (p.colorVariants as { color: string; images: string[] }[])
      : [];
    const normalizedVariants =
      colorVariants.length > 0
        ? colorVariants
        : [{ color: colors[0] || "Default", images }];

    return {
      _id: String(p._id),
      name: String(p.name),
      brand: String(p.brand || ""),
      category: String(p.category || ""),
      price: Number(p.price || 0),
      description: String(p.description || ""),
      sizes: Array.isArray(p.sizes) ? (p.sizes as string[]) : [],
      colors: normalizedVariants.map((variant) => variant.color),
      colorVariants: normalizedVariants,
      stockQuantity: Number(p.stockQuantity || 0),
      images,
      discount: Number(p.discount || 0),
      inStock: Boolean(p.inStock),
      isActive: p.isActive !== false,
      popularityScore: Number(p.popularityScore || 0),
      soldCount: Number(p.soldCount || 0),
      slug: String(p.slug || ""),
      metaTitle: String(p.metaTitle || ""),
      metaDescription: String(p.metaDescription || ""),
      createdAt: String(p.createdAt),
      updatedAt: String(p.updatedAt),
    };
  });

  return <ShopClient products={products} />;
}
