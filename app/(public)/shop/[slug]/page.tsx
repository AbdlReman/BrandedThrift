import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { serializeProductFromLean } from "@/lib/serializeProduct";
import Product from "@/models/Product";
import type { IProduct } from "@/types/product";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const raw = await Product.findOne({ slug, isActive: true }).lean();
  if (!raw) return {};

  const product = serializeProductFromLean(raw as Record<string, unknown>);
  const hasDiscount = Number(product.discount || 0) > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const title = product.metaTitle?.trim()
    ? product.metaTitle.trim()
    : `${product.name} | ${product.brand} Shoes in Pakistan | Branded Thrift`;

  const description = product.metaDescription?.trim()
    ? product.metaDescription.trim()
    : `Buy authentic ${product.brand} ${product.name} in Pakistan for Rs ${finalPrice.toLocaleString()}. 100% original${hasDiscount ? `, ${Math.round(product.discount)}% off` : ""}. Free delivery to Rawalpindi, Islamabad & all over Pakistan.`;
  const image = product.images?.[0] || "/images/hero.jpeg";
  const url = `https://www.brandedthrift.store/shop/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${product.brand} shoes Pakistan`,
      `${product.name} Pakistan`,
      `${product.brand} ${product.name}`,
      `buy ${product.brand} Pakistan`,
      `original ${product.brand} shoes`,
      "branded shoes Pakistan",
      "branded shoes Rawalpindi",
      "branded shoes Islamabad",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

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
