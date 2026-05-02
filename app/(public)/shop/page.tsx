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
    const rawVariants = Array.isArray(p.colorVariants)
      ? (p.colorVariants as { color: string; images: string[] }[])
      : [];
    const variantMap = new Map<string, string[]>();
    for (const variant of rawVariants) {
      const key = String(variant.color || "").trim();
      if (!key) continue;
      const variantImages = Array.isArray(variant.images) && variant.images.length > 0 ? variant.images : images;
      variantMap.set(key, variantImages);
    }
    for (const color of colors) {
      const key = String(color || "").trim();
      if (!key || variantMap.has(key)) continue;
      const idx = colors.findIndex((c) => String(c).trim() === key);
      const matchedImage = idx >= 0 ? images[idx] : undefined;
      variantMap.set(key, matchedImage ? [matchedImage] : images);
    }
    if (variantMap.size === 0) variantMap.set("Default", images);
    const normalizedVariants = Array.from(variantMap.entries()).map(([color, variantImages]) => ({
      color,
      images: variantImages,
    }));

    return {
      _id: String(p._id),
      name: String(p.name),
      brand: String(p.brand || ""),
      category: String(p.category || ""),
      price: Number(p.price || 0),
      description: String(p.description || p.longDescription || p.shortDescription || ""),
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
