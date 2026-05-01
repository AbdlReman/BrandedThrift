"use client";

import { useState } from "react";
import Link from "next/link";

const allProducts = [
  { id: 1,  name: "Velocity Runner Pro",    price: 129, originalPrice: 180, brand: "PUMA",        category: "Running",   color: "Black / White",   bg: "bg-gray-100",   emoji: "👟" },
  { id: 2,  name: "Street Glide Elite",     price: 99,  originalPrice: 145, brand: "NIKE",        category: "Lifestyle", color: "Red / Black",     bg: "bg-red-50",     emoji: "👟" },
  { id: 3,  name: "Classic Court Low",      price: 85,  originalPrice: 120, brand: "ADIDAS",      category: "Lifestyle", color: "White / Navy",    bg: "bg-blue-50",    emoji: "👟" },
  { id: 4,  name: "Trail Blazer X9",        price: 149, originalPrice: 210, brand: "NEW BALANCE", category: "Running",   color: "Grey / Orange",   bg: "bg-orange-50",  emoji: "👟" },
  { id: 5,  name: "Force Court Mid",        price: 110, originalPrice: 160, brand: "NIKE",        category: "Training",  color: "White / Black",   bg: "bg-gray-50",    emoji: "👟" },
  { id: 6,  name: "Suede Classic XXI",      price: 75,  originalPrice: 100, brand: "PUMA",        category: "Lifestyle", color: "Peacoat / Gum",   bg: "bg-yellow-50",  emoji: "👟" },
  { id: 7,  name: "Ultra Boost 22",         price: 159, originalPrice: 220, brand: "ADIDAS",      category: "Running",   color: "Core Black",      bg: "bg-gray-200",   emoji: "👟" },
  { id: 8,  name: "Fresh Foam 1080v12",     price: 165, originalPrice: 230, brand: "NEW BALANCE", category: "Running",   color: "White / Sea Salt", bg: "bg-teal-50",   emoji: "👟" },
  { id: 9,  name: "Air Max 270",            price: 139, originalPrice: 190, brand: "NIKE",        category: "Lifestyle", color: "Black / Total Orange", bg: "bg-orange-100", emoji: "👟" },
  { id: 10, name: "RS-X Puzzle",            price: 95,  originalPrice: 130, brand: "PUMA",        category: "Lifestyle", color: "White / Multi",   bg: "bg-pink-50",    emoji: "👟" },
  { id: 11, name: "Ultraboost Light",       price: 175, originalPrice: 240, brand: "ADIDAS",      category: "Running",   color: "Cloud White",     bg: "bg-white",      emoji: "👟" },
  { id: 12, name: "Metacon RX 2.0",         price: 120, originalPrice: 165, brand: "REEBOK",      category: "Training",  color: "Black / Silver",  bg: "bg-slate-100",  emoji: "👟" },
];

const brands = ["All", "PUMA", "NIKE", "ADIDAS", "NEW BALANCE", "REEBOK"];
const categories = ["All", "Running", "Lifestyle", "Training"];
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Biggest Discount"];

export default function ShopPage() {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = allProducts
    .filter((p) => (selectedBrand === "All" || p.brand === selectedBrand))
    .filter((p) => (selectedCategory === "All" || p.category === selectedCategory))
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Biggest Discount") return (b.originalPrice - b.price) - (a.originalPrice - a.price);
      return 0;
    });

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {" / "}Shop
          </p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight">
            All Shoes
          </h1>
          <p className="text-gray-400 mt-3">{filtered.length} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters
            </button>
            {[selectedBrand !== "All" && selectedBrand, selectedCategory !== "All" && selectedCategory]
              .filter(Boolean)
              .map((tag) => (
                <span key={tag as string} className="flex items-center gap-2 text-xs font-bold bg-black text-white px-3 py-1">
                  {tag as string}
                  <button onClick={() => {
                    if (tag === selectedBrand) setSelectedBrand("All");
                    else setSelectedCategory("All");
                  }}>×</button>
                </span>
              ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold uppercase tracking-widest border border-gray-300 px-3 py-2 focus:outline-none focus:border-black"
            >
              {sortOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 bg-gray-50 border border-gray-200">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">Brand</h3>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border transition-colors ${
                      selectedBrand === b
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border transition-colors ${
                      selectedCategory === c
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl font-black uppercase text-gray-200 mb-4">No Results</p>
            <p className="text-gray-500 mb-8">Try removing some filters.</p>
            <button onClick={() => { setSelectedBrand("All"); setSelectedCategory("All"); }} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.id} className="product-card group cursor-pointer">
                <div className={`${product.bg} h-64 flex items-center justify-center overflow-hidden mb-4 relative border border-gray-100`}>
                  <span className="text-7xl product-img inline-block">{product.emoji}</span>
                  <span className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-widest">
                    {product.brand}
                  </span>
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                  {/* Quick add button */}
                  <button className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs font-bold uppercase tracking-widest py-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    Quick Add
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-xs mb-2">{product.color}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg">${product.price}</span>
                    <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
