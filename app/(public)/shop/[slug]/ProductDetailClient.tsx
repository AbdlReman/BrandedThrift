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
  const variants = useMemo(() => {
    if (product.colorVariants.length > 0) return product.colorVariants;
    if (product.colors.length > 0) {
      return product.colors.map((color) => ({ color, images: product.images }));
    }
    return [{ color: "Default", images: product.images }];
  }, [product.colorVariants, product.colors, product.images]);

  const [selectedColor, setSelectedColor] = useState(variants[0]?.color || "Default");
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
  const [selectedImage, setSelectedImage] = useState(colorImages[0] || allImages[0] || "");
  const mainImage = selectedImage || colorImages[0] || allImages[0] || "";

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const nextVariant = variants.find((variant) => variant.color === color) || variants[0];
    const nextImages = nextVariant?.images?.length ? nextVariant.images : product.images;
    setSelectedImage(nextImages[0] || allImages[0] || "");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="bg-gray-100 border border-gray-200 h-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {allImages.map((image, idx) => (
              <button
                key={`${image}-${idx}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`border bg-gray-100 h-24 ${
                  mainImage === image ? "border-black" : "border-gray-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`${product.name}-${idx}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{product.name}</h1>
          <p className="text-2xl font-black mt-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mt-4 leading-relaxed">
            {product.description || "Premium product with authentic quality and comfort."}
          </p>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Colors</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={`${product._id}-${variant.color}`}
                  type="button"
                  onClick={() => handleColorChange(variant.color)}
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
            onClick={() => addToCart(product, selectedColor || "Default", mainImage)}
            className="mt-8 w-full md:w-auto bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
