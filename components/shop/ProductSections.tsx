"use client";

import Link from "next/link";
import type { IProduct } from "@/types/product";
import ProductCard from "./ProductCard";

export function RelatedProductsSection({
  title,
  products,
}: {
  title: string;
  products: IProduct[];
}) {
  if (!products.length) return null;

  return (
    <section className="border-t border-neutral-200/90 pt-16" aria-labelledby="related-heading">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="related-heading" className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Curated picks in the same spirit.</p>
        </div>
        <Link
          href="/shop"
          className="text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/25 rounded-sm"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, idx) => (
          <ProductCard key={p._id} product={p} priority={idx < 2} />
        ))}
      </div>
    </section>
  );
}

export function RecentlyViewedSection({
  entries,
}: {
  entries: {
    slug: string;
    name: string;
    image: string;
    brand: string;
    price: number;
    discount: number;
  }[];
}) {
  if (!entries.length) return null;

  return (
    <section className="border-t border-neutral-200/90 pt-16 mt-16" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl mb-10">
        Recently viewed
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((e) => {
          const productLike = {
            _id: `recent-${e.slug}`,
            name: e.name,
            brand: e.brand,
            category: "",
            price: e.price,
            description: "",
            detail: "",
            sizes: [],
            colors: [],
            colorVariants: [{ color: "Classic", images: e.image ? [e.image] : [] }],
            stockQuantity: 0,
            images: e.image ? [e.image] : [],
            discount: e.discount,
            inStock: true,
            isActive: true,
            status: "Published" as const,
            popularityScore: 0,
            soldCount: 0,
            slug: e.slug,
            metaTitle: "",
            metaDescription: "",
            createdAt: "",
            updatedAt: "",
          } satisfies IProduct;

          return <ProductCard key={e.slug} product={productLike} />;
        })}
      </div>
    </section>
  );
}
