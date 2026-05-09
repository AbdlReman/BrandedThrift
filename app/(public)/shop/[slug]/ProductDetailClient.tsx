"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Breadcrumbs from "@/components/shop/Breadcrumbs";
import ProductRatingSummary from "@/components/shop/ProductRatingSummary";
import { RelatedProductsSection, RecentlyViewedSection } from "@/components/shop/ProductSections";
import type { CartItem, IProduct } from "@/types/product";
import { formatPkr } from "@/lib/formatCurrency";
import { pushRecentlyViewed, readRecentlyViewed } from "@/lib/recentlyViewed";
import ProductReviewsPanel from "./ProductReviewsPanel";

function addToCart(
  product: IProduct,
  selectedColor: string,
  selectedImage: string,
  selectedSize: string,
  quantity: number
) {
  const qty = Math.max(1, Math.floor(quantity || 1));
  const existing = JSON.parse(localStorage.getItem("cart_items") || "[]");
  const sizeKey = selectedSize || "";
  const index = existing.findIndex(
    (i: { productId: string; color?: string; size?: string }) =>
      i.productId === product._id &&
      (i.color || "") === (selectedColor || "") &&
      (i.size || "") === sizeKey
  );
  if (index >= 0) existing[index].quantity += qty;
  else {
    existing.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: selectedImage,
      quantity: qty,
      color: selectedColor,
      size: sizeKey,
    });
  }
  localStorage.setItem("cart_items", JSON.stringify(existing));
  window.dispatchEvent(new Event("cart_updated"));
}

function setCartToSingleItem(item: CartItem) {
  localStorage.setItem("cart_items", JSON.stringify([item]));
  window.dispatchEvent(new Event("cart_updated"));
}

function isCloudinary(url: string) {
  return url.startsWith("https://res.cloudinary.com/");
}

export default function ProductDetailClient({
  product,
  relatedProducts = [],
  siteUrl = "",
}: {
  product: IProduct;
  relatedProducts?: IProduct[];
  siteUrl?: string;
}) {
  const router = useRouter();
  const availableStock = Math.max(0, Number(product.stockQuantity || 0));
  const isOutOfStock = availableStock <= 0;
  const variants = useMemo(() => {
    if (product.colorVariants.length > 0) return product.colorVariants;
    if (product.colors.length > 0) {
      return product.colors.map((color) => ({ color, images: product.images }));
    }
    return [{ color: "Default", images: product.images }];
  }, [product.colorVariants, product.colors, product.images]);

  const [selectedColor, setSelectedColor] = useState(variants[0]?.color || "Default");
  const sizes = useMemo(
    () => (Array.isArray(product.sizes) ? product.sizes.map((s) => String(s).trim()).filter(Boolean) : []),
    [product.sizes]
  );
  const [selectedSize, setSelectedSize] = useState(() => sizes[0] || "");
  const maxSelectableQty = useMemo(() => {
    if (availableStock > 0) return Math.min(99, availableStock);
    return 1;
  }, [availableStock]);
  const [quantity, setQuantity] = useState(1);
  const hasDiscount = Number(product.discount || 0) > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

  const bumpQty = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;
      return Math.min(maxSelectableQty, Math.max(1, next));
    });
  };

  const lineQty = isOutOfStock ? 1 : Math.min(Math.max(1, quantity), maxSelectableQty);

  const allImages = useMemo(() => {
    const fromVariants = variants.flatMap((variant) => variant.images || []);
    const merged = [...fromVariants, ...product.images].filter(Boolean);
    return Array.from(new Set(merged));
  }, [variants, product.images]);

  const activeVariant = useMemo(
    () => variants.find((variant) => variant.color === selectedColor) || variants[0],
    [variants, selectedColor]
  );
  const colorImages = activeVariant?.images?.length ? activeVariant.images : product.images;
  const thumbImages = useMemo(() => {
    const primary = (colorImages.length ? colorImages : product.images).filter(Boolean);
    const rest = allImages.filter((u) => !primary.includes(u));
    return [...primary, ...rest];
  }, [colorImages, product.images, allImages]);

  const [selectedImage, setSelectedImage] = useState(colorImages[0] || allImages[0] || "");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [recentEntries, setRecentEntries] = useState<
    { slug: string; name: string; image: string; brand: string; price: number; discount: number }[]
  >([]);

  const mainImage = selectedImage || colorImages[0] || allImages[0] || "";
  const imageIndex = Math.max(0, thumbImages.indexOf(mainImage));

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const nextVariant = variants.find((variant) => variant.color === color) || variants[0];
    const nextImages = nextVariant?.images?.length ? nextVariant.images : product.images;
    setSelectedImage(nextImages[0] || allImages[0] || "");
  };

  useEffect(() => {
    const previewImg = variants[0]?.images?.[0] || product.images[0] || "";
    pushRecentlyViewed(
      {
        slug: product.slug,
        name: product.name,
        image: previewImg,
        brand: product.brand,
        price: product.price,
        discount: product.discount,
      },
      product.slug
    );
    // Sync carousel after writing localStorage (recently viewed rail).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only localStorage sync on visit
    setRecentEntries(readRecentlyViewed().filter((e) => e.slug !== product.slug));
  }, [product._id, product.slug, product.name, product.brand, product.price, product.discount, product.images, variants]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showImagePreview) return;
      if (e.key === "ArrowLeft") {
        setSelectedImage((cur) => {
          const i = thumbImages.indexOf(cur);
          const next = i <= 0 ? thumbImages.length - 1 : i - 1;
          return thumbImages[next] || cur;
        });
      }
      if (e.key === "ArrowRight") {
        setSelectedImage((cur) => {
          const i = thumbImages.indexOf(cur);
          const next = i < 0 || i >= thumbImages.length - 1 ? 0 : i + 1;
          return thumbImages[next] || cur;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [thumbImages, showImagePreview]);

  const jsonLd = useMemo(() => {
    const images = thumbImages.filter(Boolean).slice(0, 8);
    const offerUrl = siteUrl ? `${siteUrl}/shop/${product.slug}` : `/shop/${product.slug}`;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || product.metaDescription,
      image: images,
      sku: product._id,
      brand: {
        "@type": "Brand",
        name: product.brand || "Store",
      },
      offers: {
        "@type": "Offer",
        url: offerUrl,
        priceCurrency: "PKR",
        price: Number(finalPrice.toFixed(2)),
        availability: `https://schema.org/${isOutOfStock ? "OutOfStock" : "InStock"}`,
      },
    };
  }, [product, thumbImages, siteUrl, finalPrice, isOutOfStock]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(product.category ? [{ label: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` }] : []),
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-28 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} className="text-neutral-500" />
        </div>
      </header>

      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Gallery */}
          <div className="flex flex-col gap-4 xl:flex-row xl:gap-5">
            <div className="order-2 flex gap-2 overflow-x-auto pb-1 xl:order-1 xl:w-[5.5rem] xl:flex-col xl:overflow-y-auto xl:pb-0 xl:pr-1">
              {thumbImages.map((image, idx) => {
                const active = mainImage === image;
                return (
                  <button
                    key={`${image}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition xl:h-[4.5rem] xl:w-full ${
                      active ? "ring-neutral-950 shadow-lg" : "ring-transparent opacity-80 hover:opacity-100"
                    }`}
                    aria-label={`View image ${idx + 1}`}
                    aria-current={active ? "true" : undefined}
                  >
                    {isCloudinary(image) ? (
                      <Image src={image} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative order-1 min-w-0 flex-1 xl:order-2">
              <div
                className="group relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200 ring-1 ring-neutral-200/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)]"
                tabIndex={0}
                role="region"
                aria-label="Product gallery"
              >
                {hasDiscount ? (
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg">
                    −{Math.round(product.discount)}%
                  </div>
                ) : null}
                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide shadow-md backdrop-blur-md ${
                      isOutOfStock
                        ? "bg-neutral-800/90 text-white"
                        : availableStock <= 5
                          ? "bg-amber-500/95 text-white"
                          : "bg-emerald-600/95 text-white"
                    }`}
                  >
                    {isOutOfStock ? "Out of stock" : availableStock <= 5 ? `Only ${availableStock} left` : "In stock"}
                  </span>
                  {product.soldCount > 0 ? (
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-neutral-800 shadow-md backdrop-blur-md">
                      {product.soldCount}+ sold
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setShowImagePreview(true)}
                  className="relative block h-full w-full cursor-zoom-in outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15"
                  aria-label={`Open ${product.name} fullscreen`}
                >
                  {mainImage && isCloudinary(mainImage) ? (
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      priority
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">No image</div>
                  )}
                </button>

                <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                  {imageIndex + 1} / {thumbImages.length}
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-neutral-400 xl:text-left">
                Use arrow keys to browse images when this area is focused.
              </p>
            </div>
          </div>

          {/* Buy column */}
          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">{product.brand || "Collection"}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">{product.name}</h1>

            <div className="mt-6">
              <ProductRatingSummary productId={product._id} />
            </div>

            <div className="mt-8 flex flex-wrap items-end gap-3 border-b border-neutral-200/90 pb-8">
              {hasDiscount ? (
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl font-semibold tabular-nums tracking-tight text-neutral-950">
                    {formatPkr(finalPrice)}
                  </span>
                  <span className="text-lg text-neutral-400 line-through tabular-nums">{formatPkr(product.price)}</span>
                </div>
              ) : (
                <span className="text-4xl font-semibold tabular-nums tracking-tight text-neutral-950">
                  {formatPkr(product.price)}
                </span>
              )}
              <span className="text-sm text-neutral-500">Inclusive of duties where applicable.</span>
            </div>

            <p className="mt-8 text-base leading-relaxed text-neutral-600">{product.description || "Designed with intention — premium materials, refined proportions, and everyday comfort."}</p>

            <div className="mt-10 grid gap-4 rounded-2xl border border-neutral-200/80 bg-white/70 p-5 shadow-[0_16px_50px_-40px_rgba(15,23,42,0.35)] backdrop-blur-md sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Availability</p>
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  {isOutOfStock ? "Currently unavailable" : `${availableStock} available`}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">SKU</p>
                <p className="mt-2 text-sm font-medium tabular-nums text-neutral-900">{product._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Color</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={`${product._id}-${variant.color}`}
                    type="button"
                    onClick={() => handleColorChange(variant.color)}
                    className={`min-h-11 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                      selectedColor === variant.color
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-md"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    {variant.color}
                  </button>
                ))}
              </div>
            </div>

            {sizes.length > 0 ? (
              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Size</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={`${product._id}-size-${size}`}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex min-h-11 min-w-[3rem] items-center justify-center rounded-xl border text-sm font-semibold transition ${
                        selectedSize === size
                          ? "border-neutral-950 bg-neutral-950 text-white shadow-md"
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Quantity</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => bumpQty(-1)}
                    disabled={quantity <= 1}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    −
                  </button>
                  <span className="min-w-[3rem] text-center text-base font-semibold tabular-nums">{lineQty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => bumpQty(1)}
                    disabled={isOutOfStock || quantity >= maxSelectableQty}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    +
                  </button>
                </div>
                {!isOutOfStock ? (
                  <span className="text-sm text-neutral-500">{availableStock} in stock</span>
                ) : (
                  <span className="text-sm font-semibold uppercase tracking-wide text-red-600">Notify me when back</span>
                )}
              </div>
            </div>

            <div className="mt-10 hidden flex-col gap-3 sm:flex-row lg:flex">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  const qty = Math.max(1, Math.floor(lineQty || 1));
                  addToCart(product, selectedColor || "Default", mainImage, selectedSize, qty);
                  setQuantity(1);
                  toast.success("Added to bag", {
                    description: `${product.name} · Qty ${qty}${selectedSize ? ` · Size ${selectedSize}` : ""}`,
                  });
                }}
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-neutral-950 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_-20px_rgba(0,0,0,0.65)] transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {isOutOfStock ? "Unavailable" : "Add to bag"}
              </button>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  const qty = Math.max(1, Math.floor(lineQty || 1));
                  const line: CartItem = {
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    image: mainImage,
                    quantity: qty,
                    color: selectedColor || "Default",
                    size: selectedSize || "",
                  };
                  setCartToSingleItem(line);
                  toast.success("Checkout", {
                    description: `${product.name} × ${qty}`,
                  });
                  router.push("/checkout");
                }}
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-2xl border-2 border-neutral-950 bg-white px-8 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-950 transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300"
              >
                {isOutOfStock ? "Unavailable" : "Buy now"}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Secure checkout
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Easy returns
              </span>
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-6 border-t border-neutral-200/90 pt-16 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/60 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-neutral-950">Shipping</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Complimentary standard delivery on qualifying orders. Express options available at checkout.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white/60 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-neutral-950">Returns</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              30-day returns in original condition. Initiate from your account or contact support for assistance.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white/60 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-neutral-950">Authenticity</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Every piece is sourced and fulfilled with the same quality standards we stand behind in-store.
            </p>
          </div>
        </section>

        <div className="mt-20">
          <TabbedProductSections productId={product._id} detailHtml={product.detail} productName={product.name} />
        </div>

        <RelatedProductsSection title="You may also like" products={relatedProducts} />

        <RecentlyViewedSection entries={recentEntries} />
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/90 bg-white/90 p-4 shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-[90rem] gap-3">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return;
              const qty = Math.max(1, Math.floor(lineQty || 1));
              addToCart(product, selectedColor || "Default", mainImage, selectedSize, qty);
              setQuantity(1);
              toast.success("Added to bag", { description: `${product.name} · Qty ${qty}` });
            }}
            className="flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg transition active:scale-[0.99] disabled:bg-neutral-300"
          >
            {isOutOfStock ? "Unavailable" : "Add to bag"}
          </button>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return;
              const qty = Math.max(1, Math.floor(lineQty || 1));
              setCartToSingleItem({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: mainImage,
                quantity: qty,
                color: selectedColor || "Default",
                size: selectedSize || "",
              });
              router.push("/checkout");
            }}
            className="flex min-h-14 flex-1 items-center justify-center rounded-2xl border-2 border-neutral-950 bg-white text-sm font-semibold uppercase tracking-[0.18em] text-neutral-950 disabled:border-neutral-200 disabled:text-neutral-300"
          >
            Buy now
          </button>
        </div>
      </div>

      {showImagePreview ? (
        <button
          type="button"
          className="fixed inset-0 z-[90] flex cursor-zoom-out items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setShowImagePreview(false)}
          aria-label="Close fullscreen image"
        >
          <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-md">
            ×
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={product.name}
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      ) : null}
    </div>
  );
}

function TabbedProductSections({
  productId,
  detailHtml,
  productName,
}: {
  productId: string;
  detailHtml: string;
  productName: string;
}) {
  const [tab, setTab] = useState<"details" | "reviews">("details");
  return (
    <div className="rounded-3xl border border-neutral-200/80 bg-white/70 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-10">
      <div className="flex flex-wrap gap-2 border-b border-neutral-200/90 pb-4">
        <button
          type="button"
          onClick={() => setTab("details")}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            tab === "details" ? "bg-neutral-950 text-white shadow-md" : "text-neutral-600 hover:bg-neutral-100"
          }`}
          aria-selected={tab === "details"}
          role="tab"
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => setTab("reviews")}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            tab === "reviews" ? "bg-neutral-950 text-white shadow-md" : "text-neutral-600 hover:bg-neutral-100"
          }`}
          aria-selected={tab === "reviews"}
          role="tab"
        >
          Reviews
        </button>
      </div>

      <div className="mt-8" role="tabpanel">
        {tab === "details" ? (
          detailHtml ? (
            <div
              className="prose prose-neutral prose-sm max-w-none prose-headings:font-semibold prose-p:text-neutral-600"
              dangerouslySetInnerHTML={{ __html: detailHtml }}
            />
          ) : (
            <p className="text-neutral-600 leading-relaxed">
              Detailed specifications for {productName} will appear here when provided.
            </p>
          )
        ) : (
          <ProductReviewsPanel productId={productId} />
        )}
      </div>
    </div>
  );
}
