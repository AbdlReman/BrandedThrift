"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { IProduct } from "@/types/product";
import { formatPkr } from "@/lib/formatCurrency";

function cardPrice(product: IProduct) {
  const hasDiscount = Number(product.discount || 0) > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - finalPrice / Math.max(product.price, 1)) * 100)
    : 0;
  return { hasDiscount, finalPrice, discountPercent };
}

export default function ProductCard({
  product,
  onOpenImage,
  priority,
}: {
  product: IProduct;
  onOpenImage?: (src: string, alt: string) => void;
  priority?: boolean;
}) {
  const [selectedColor] = useState(product.colorVariants[0]?.color || product.colors[0] || "");
  const activeVariant =
    product.colorVariants.find((variant) => variant.color === selectedColor) || product.colorVariants[0];
  const mainImage = activeVariant?.images?.[0] || product.images[0] || "";
  const displayColor = selectedColor || product.colors[0] || "";
  const { hasDiscount, finalPrice, discountPercent } = cardPrice(product);
  const soldNote = product.soldCount > 0 ? `${product.soldCount}+ sold` : null;

  const cloudinary = mainImage.startsWith("https://res.cloudinary.com");

  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-100 to-neutral-200/80 ring-1 ring-neutral-200/80 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_18px_48px_-24px_rgba(15,23,42,0.35)] transition-all duration-500 ease-out hover:shadow-[0_24px_64px_-28px_rgba(15,23,42,0.45)] hover:ring-neutral-300/90 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          {product.brand ? (
            <span className="absolute left-3 top-3 z-10 inline-flex max-w-[calc(100%-1.5rem)] rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-900 shadow-sm backdrop-blur-md">
              <span className="truncate">{product.brand}</span>
            </span>
          ) : null}
          {hasDiscount ? (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              −{discountPercent}%
            </span>
          ) : null}
          {soldNote ? (
            <span className="absolute bottom-3 left-3 z-10 rounded-full bg-neutral-950/80 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/95 backdrop-blur-sm">
              {soldNote}
            </span>
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {onOpenImage ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenImage(mainImage, product.name);
              }}
              className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg backdrop-blur-md opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
              aria-label={`Quick view image for ${product.name}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </button>
          ) : null}

          {mainImage ? (
            cloudinary ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                priority={priority}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400 text-xs tracking-widest uppercase">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col px-0.5">
        <Link href={`/shop/${product.slug}`} className="block">
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-neutral-950 transition-colors group-hover:text-neutral-600 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {displayColor ? (
          <p className="mt-1 text-xs font-medium tracking-wide text-neutral-500">{displayColor}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-semibold tabular-nums tracking-tight text-neutral-950">
            {formatPkr(finalPrice)}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-neutral-400 line-through tabular-nums">{formatPkr(product.price)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
