"use client";

import { useMemo, useState } from "react";
import type { IProduct } from "@/types/product";

function addToCart(product: IProduct, selectedColor: string, selectedImage: string) {
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
      image: selectedImage,
      quantity: 1,
      color: selectedColor,
      size: product.sizes[0] || "",
    });
  }
  localStorage.setItem("cart_items", JSON.stringify(existing));
  window.dispatchEvent(new Event("cart_updated"));
}

export default function ProductDetailClient({ product }: { product: IProduct }) {
  const [selectedColor, setSelectedColor] = useState(
    product.colorVariants[0]?.color || product.colors[0] || ""
  );
  const activeVariant = useMemo(
    () =>
      product.colorVariants.find((variant) => variant.color === selectedColor) ||
      product.colorVariants[0],
    [product.colorVariants, selectedColor]
  );
  const images = activeVariant?.images?.length ? activeVariant.images : product.images;
  const mainImage = images[0] || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="bg-gray-100 border border-gray-200 h-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {images.map((image, idx) => (
              <div key={`${image}-${idx}`} className="border border-gray-200 bg-gray-100 h-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`${product.name}-${idx}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{product.name}</h1>
          <p className="text-2xl font-black mt-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Colors</p>
            <div className="flex flex-wrap gap-2">
              {product.colorVariants.map((variant) => (
                <button
                  key={`${product._id}-${variant.color}`}
                  onClick={() => setSelectedColor(variant.color)}
                  className={`text-xs px-3 py-2 border font-semibold ${
                    selectedColor === variant.color
                      ? "bg-black text-white border-black"
                      : "border-gray-300"
                  }`}
                >
                  {variant.color}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => addToCart(product, selectedColor, mainImage)}
            className="mt-8 w-full md:w-auto bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
