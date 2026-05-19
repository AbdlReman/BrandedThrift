import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { serializeProductFromLean } from "@/lib/serializeProduct";
import Product from "@/models/Product";
import type { IProduct } from "@/types/product";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Branded Shoes in Pakistan | Nike, Adidas, Puma & More",
  description:
    "Browse our full collection of 100% authentic branded shoes — Nike, Adidas, Puma, Converse & more. Buy preloved branded shoes in Rawalpindi, Islamabad & across Pakistan. Free delivery.",
  keywords: [
    "shop branded shoes Pakistan",
    "Nike shoes Pakistan",
    "Adidas shoes Pakistan",
    "Puma shoes Pakistan",
    "Converse shoes Pakistan",
    "branded sneakers Pakistan",
    "original shoes Rawalpindi",
    "original shoes Islamabad",
    "buy shoes online Pakistan",
    "authentic shoes Pakistan",
  ],
  alternates: { canonical: "https://www.brandedthrift.store/shop" },
  openGraph: {
    title: "Shop Branded Shoes in Pakistan | Branded Thrift",
    description:
      "100% authentic Nike, Adidas, Puma & more — preloved branded shoes delivered free all over Pakistan.",
    url: "https://www.brandedthrift.store/shop",
  },
};

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
