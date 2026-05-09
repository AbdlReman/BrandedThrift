"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { IProduct } from "@/types/product";
import { formatPkr } from "@/lib/formatCurrency";

/** Puma-style sale red */
const SALE_RED = "#e4002b";

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
  const cloudinary = mainImage.startsWith("https://res.cloudinary.com");

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block overflow-hidden bg-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/5]">
          {hasDiscount ? (
            <span
              className="absolute right-2 top-2 z-10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: SALE_RED }}
            >
              −{discountPercent}%
            </span>
          ) : null}
          {onOpenImage && mainImage ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenImage(mainImage, product.name);
              }}
              className="absolute bottom-2 right-2 z-10 border border-black/10 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Enlarge ${product.name}`}
            >
              View
            </button>
          ) : null}
          {mainImage ? (
            cloudinary ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
                priority={priority}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-neutral-400">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2.5 flex flex-1 flex-col">
        {product.brand ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">{product.brand}</p>
        ) : null}
        <Link href={`/shop/${product.slug}`} className="mt-1 block">
          <h3 className="text-[12px] font-bold uppercase leading-snug tracking-wide text-black line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {displayColor ? <p className="mt-0.5 text-[11px] text-neutral-600">{displayColor}</p> : null}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[13px] font-bold tabular-nums text-black">{formatPkr(finalPrice)}</span>
          {hasDiscount ? (
            <span className="text-xs text-neutral-400 line-through tabular-nums">{formatPkr(product.price)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
