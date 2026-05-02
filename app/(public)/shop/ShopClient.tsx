"use client";

import { useMemo, useState } from "react";
import type { IProduct } from "@/types/product";
import Link from "next/link";

const SORTS = [
  { value: "latest", label: "Latest Products" },
  { value: "priceLow", label: "Low to High Price" },
  { value: "priceHigh", label: "High to Low Price" },
  { value: "popular", label: "Popular Products" },
];

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
}

function ProductCard({ product }: { product: IProduct }) {
  const [selectedColor, setSelectedColor] = useState(product.colorVariants[0]?.color || product.colors[0] || "");
  const activeVariant = product.colorVariants.find((variant) => variant.color === selectedColor) || product.colorVariants[0];
  const mainImage = activeVariant?.images?.[0] || product.images[0] || "";

  return (
    <div className="product-card border border-gray-100 p-3">
      <div className="h-56 bg-gray-100 flex items-center justify-center mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <p className="text-xs text-gray-500 uppercase">{product.category}</p>
      <h3 className="font-bold text-sm uppercase tracking-wide">{product.name}</h3>
      <p className="text-xs text-gray-400">{product.brand}</p>

      {product.colorVariants.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {product.colorVariants.map((variant) => (
            <button
              key={`${product._id}-${variant.color}`}
              type="button"
              onClick={() => setSelectedColor(variant.color)}
              className={`text-[11px] px-2 py-1 border ${
                selectedColor === variant.color ? "border-black bg-black text-white" : "border-gray-300"
              }`}
            >
              {variant.color}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="font-black text-lg">${product.price.toFixed(2)}</span>
        {product.discount > 0 && (
          <span className="text-xs bg-red-600 text-white px-2 py-1">-{product.discount}%</span>
        )}
      </div>
      <button
        onClick={() => addToCart(product, selectedColor, mainImage)}
        className="w-full mt-3 bg-black text-white text-xs font-bold uppercase tracking-widest py-2"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default function ShopClient({ products }: { products: IProduct[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const brands = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.brand)))], [products]);
  const sizes = useMemo(() => ["All", ...Array.from(new Set(products.flatMap((p) => p.sizes)))], [products]);
  const colors = useMemo(() => ["All", ...Array.from(new Set(products.flatMap((p) => p.colors)))], [products]);

  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const filtered = useMemo(() => {
    return products
      .filter((p) => category === "All" || p.category === category)
      .filter((p) => brand === "All" || p.brand === brand)
      .filter((p) => size === "All" || p.sizes.includes(size))
      .filter((p) => color === "All" || p.colors.includes(color))
      .filter((p) => p.price >= minPrice && p.price <= maxPrice)
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === "priceLow") return a.price - b.price;
        if (sort === "priceHigh") return b.price - a.price;
        if (sort === "popular") return b.popularityScore - a.popularityScore;
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
  }, [products, category, brand, size, color, minPrice, maxPrice, search, sort]);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-black text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Shop
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tight">All Shoes</h1>
          <p className="text-gray-400 mt-2">{filtered.length} products</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-6 gap-3 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." className="border px-3 py-2 md:col-span-2" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border px-3 py-2">{categories.map((v) => <option key={v}>{v}</option>)}</select>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="border px-3 py-2">{brands.map((v) => <option key={v}>{v}</option>)}</select>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="border px-3 py-2">{sizes.map((v) => <option key={v}>{v}</option>)}</select>
          <select value={color} onChange={(e) => setColor(e.target.value)} className="border px-3 py-2">{colors.map((v) => <option key={v}>{v}</option>)}</select>
        </div>
        <div className="grid md:grid-cols-4 gap-3 mb-8">
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value || 0))} className="border px-3 py-2" placeholder="Min Price" />
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value || 1000))} className="border px-3 py-2" placeholder="Max Price" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border px-3 py-2 md:col-span-2">{SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
