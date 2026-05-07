"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { IProduct } from "@/types/product";
import { formatPkr } from "@/lib/formatCurrency";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SORTS = [
  { value: "latest", label: "Sort: Latest" },
  { value: "priceLow", label: "Sort: Price — Low to high" },
  { value: "priceHigh", label: "Sort: Price — High to low" },
  { value: "popular", label: "Sort: Popular" },
];

const selectClass =
  "w-full min-w-[8.5rem] max-w-[11rem] sm:max-w-none sm:min-w-[9.5rem] border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 shadow-sm " +
  "focus:outline-none focus:ring-2 focus:ring-slate-600/40 focus:border-slate-500 cursor-pointer";

const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1";

function addToCart(product: IProduct, selectedColor?: string, selectedImage?: string) {
  const existing = JSON.parse(localStorage.getItem("cart_items") || "[]");
  const index = existing.findIndex(
    (i: { productId: string; color?: string }) =>
      i.productId === product._id && (i.color || "") === (selectedColor || "")
  );
  if (index >= 0) existing[index].quantity += 1;
  else {
    existing.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: selectedImage || product.images[0] || "",
      quantity: 1,
      color: selectedColor || product.colors[0] || "",
      size: product.sizes[0] || "",
    });
  }
  localStorage.setItem("cart_items", JSON.stringify(existing));
  window.dispatchEvent(new Event("cart_updated"));
  toast.success("Added to cart", { description: product.name });
}

function ProductCard({
  product,
  onOpenImage,
}: {
  product: IProduct;
  onOpenImage: (src: string, alt: string) => void;
}) {
  const [selectedColor] = useState(product.colorVariants[0]?.color || product.colors[0] || "");
  const activeVariant =
    product.colorVariants.find((variant) => variant.color === selectedColor) || product.colorVariants[0];
  const mainImage = activeVariant?.images?.[0] || product.images[0] || "";
  const hasDiscount = Number(product.discount || 0) > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <div className="product-card border border-slate-200 bg-white rounded-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/shop/${product.slug}`}>
        <div className="relative h-72 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center mb-3">
          {hasDiscount && (
            <div className="absolute top-2 right-2 text-sm font-black tracking-widest text-red-600">
              -{Math.round(product.discount)}%
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onOpenImage(mainImage, product.name);
            }}
            className="h-full w-full cursor-zoom-in"
            aria-label={`Open ${product.name} image`}
          >
            <img src={mainImage} alt={product.name} className="h-full w-full object-contain" />
          </button>
        </div>
      </Link>
      <Link href={`/shop/${product.slug}`} className="inline-block">
        <h3 className="font-bold text-sm uppercase tracking-wide text-slate-900 hover:text-slate-700 transition-colors">
          {product.name}
        </h3>
      </Link>

      <div className="flex items-center justify-between mt-3">
        {hasDiscount ? (
          <div className="flex items-baseline gap-2">
            <span className="text-sm line-through text-gray-400">{formatPkr(product.price)}</span>
            <span className="font-black text-lg text-slate-900">{formatPkr(finalPrice)}</span>
          </div>
        ) : (
          <span className="font-black text-lg text-slate-900">{formatPkr(product.price)}</span>
        )}
      </div>
      <button
        onClick={() => addToCart(product, selectedColor, mainImage)}
        className="w-full mt-3 bg-slate-800 text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
      >
        Quick Add
      </button>
    </div>
  );
}

export default function ShopClient({ products }: { products: IProduct[] }) {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const categories = useMemo(() => {
    const rest = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...rest];
  }, [products]);
  const brands = useMemo(() => {
    const rest = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...rest];
  }, [products]);
  const sizes = useMemo(() => {
    const rest = Array.from(new Set(products.flatMap((p) => p.sizes).map(String))).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb) && a === String(na) && b === String(nb)) return na - nb;
      return a.localeCompare(b, undefined, { numeric: true });
    });
    return ["All", ...rest];
  }, [products]);
  const colors = useMemo(() => {
    const rest = Array.from(new Set(products.flatMap((p) => p.colors).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...rest];
  }, [products]);

  const [category, setCategory] = useState(
    requestedCategory && categories.includes(requestedCategory) ? requestedCategory : "All"
  );
  const [brand, setBrand] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (requestedCategory && categories.includes(requestedCategory)) {
      setCategory(requestedCategory);
      return;
    }
    setCategory("All");
  }, [requestedCategory, categories]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => category === "All" || p.category === category)
      .filter((p) => brand === "All" || p.brand === brand)
      .filter((p) => size === "All" || p.sizes.includes(size))
      .filter((p) => color === "All" || p.colors.includes(color))
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === "priceLow") return a.price - b.price;
        if (sort === "priceHigh") return b.price - a.price;
        if (sort === "popular") return b.popularityScore - a.popularityScore;
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
  }, [products, category, brand, size, color, search, sort]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-14">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Shop
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tight">All Shoes</h1>
          <p className="text-slate-300 mt-2">{filtered.length} products</p>
        </div>
      </div>
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border border-slate-200 rounded-xl bg-white px-3 py-4 sm:px-4 mb-8 shadow-sm">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-4 lg:flex-nowrap lg:gap-x-4">
            <div className="w-[calc(50%-0.375rem)] sm:w-auto sm:flex-1 sm:min-w-0">
              <label htmlFor="filter-color" className={labelClass}>
                Color
              </label>
              <select
                id="filter-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={selectClass}
              >
                {colors.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-[calc(50%-0.375rem)] sm:w-auto sm:flex-1 sm:min-w-0">
              <label htmlFor="filter-brand" className={labelClass}>
                Brand
              </label>
              <select
                id="filter-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={selectClass}
              >
                {brands.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-[calc(50%-0.375rem)] sm:w-auto sm:flex-1 sm:min-w-0">
              <label htmlFor="filter-size" className={labelClass}>
                Size
              </label>
              <select
                id="filter-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className={selectClass}
              >
                {sizes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-[calc(50%-0.375rem)] sm:w-auto sm:flex-1 sm:min-w-0">
              <label htmlFor="filter-category" className={labelClass}>
                Category
              </label>
              <select
                id="filter-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
              >
                {categories.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:flex-1 sm:min-w-[12rem] lg:w-auto lg:min-w-[13rem]">
              <label htmlFor="filter-sort" className={labelClass}>
                Sort
              </label>
              <select
                id="filter-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={selectClass}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full flex-1 min-w-[10rem] lg:min-w-[14rem]">
              <label htmlFor="filter-search" className={labelClass}>
                Search
              </label>
              <input
                id="filter-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-600/40 focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onOpenImage={(src, alt) => setPreviewImage({ src, alt })}
            />
          ))}
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 z-[90] bg-slate-900/85 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setPreviewImage(null)}
            aria-label="Close image preview"
          >
            ×
          </button>
          <img
            src={previewImage.src}
            alt={previewImage.alt}
            className="max-h-[90vh] max-w-[92vw] object-contain bg-white p-2"
          />
        </div>
      )}
    </div>
  );
}
