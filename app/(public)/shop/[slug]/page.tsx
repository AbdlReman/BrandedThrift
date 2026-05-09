import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { serializeProductFromLean } from "@/lib/serializeProduct";
import Product from "@/models/Product";
import type { IProduct } from "@/types/product";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDB();
  const raw = await Product.findOne({
    slug,
    isActive: true,
    $or: [{ status: "Published" }, { status: { $exists: false } }],
  }).lean();
  if (!raw) notFound();

  const product = serializeProductFromLean(raw as Record<string, unknown>);

  const statusClause = [{ status: "Published" }, { status: { $exists: false } }];
  const baseFilter: Record<string, unknown> = {
    slug: { $ne: slug },
    isActive: true,
    $or: statusClause,
  };

  const categoryFilter: Record<string, unknown> =
    product.category?.trim() !== ""
      ? { ...baseFilter, category: product.category }
      : baseFilter;

  let relatedLean = await Product.find(categoryFilter).sort({ popularityScore: -1, soldCount: -1 }).limit(8).lean();

  if (relatedLean.length < 4 && product.category?.trim() !== "") {
    relatedLean = await Product.find(baseFilter).sort({ popularityScore: -1, soldCount: -1 }).limit(8).lean();
  }

  const seen = new Set<string>();
  const relatedProducts: IProduct[] = [];
  for (const doc of relatedLean) {
    const rp = serializeProductFromLean(doc as Record<string, unknown>);
    if (seen.has(rp._id)) continue;
    seen.add(rp._id);
    relatedProducts.push(rp);
    if (relatedProducts.length >= 4) break;
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const siteUrl = host ? `${proto}://${host}` : "";

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} siteUrl={siteUrl} />;
}
