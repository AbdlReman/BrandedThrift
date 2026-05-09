import { connectDB } from "@/lib/mongodb";
import { serializeProductFromLean } from "@/lib/serializeProduct";
import Product from "@/models/Product";
import type { IProduct } from "@/types/product";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  await connectDB();
  const raw = await Product.find({
    isActive: true,
    $or: [{ status: "Published" }, { status: { $exists: false } }],
  })
    .sort({ createdAt: -1 })
    .lean();
  const products: IProduct[] = (raw as Record<string, unknown>[]).map((p) => serializeProductFromLean(p));

  return <ShopClient products={products} />;
}
