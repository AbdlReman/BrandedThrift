"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { CartItem, IProduct } from "@/types/product";
import { formatPkr } from "@/lib/formatCurrency";
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

/** Replaces the cart with this line only, then caller navigates to checkout (typical “Buy now”). */
function setCartToSingleItem(item: CartItem) {
  localStorage.setItem("cart_items", JSON.stringify([item]));
  window.dispatchEvent(new Event("cart_updated"));
}

export default function ProductDetailClient({ product }: { product: IProduct }) {
  const router = useRouter();
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
    const stock = Number(product.stockQuantity || 0);
    if (stock > 0) return Math.min(99, stock);
    return 99;
  }, [product.stockQuantity]);
  const [quantity, setQuantity] = useState(1);
  const hasDiscount = Number(product.discount || 0) > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

  const bumpQty = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;
      return Math.min(maxSelectableQty, Math.max(1, next));
    });
  };

  useEffect(() => {
    setQuantity((q) => Math.min(maxSelectableQty, Math.max(1, q)));
  }, [maxSelectableQty]);

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
          <div className="relative bg-gray-100 border border-gray-200 h-[460px]">
            {hasDiscount && (
              <div className="absolute top-3 right-3 text-sm font-black tracking-widest text-red-600">
                -{Math.round(product.discount)}%
              </div>
            )}
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
          <div className="mt-4 space-y-1">
            {hasDiscount ? (
              <p className="text-2xl font-black flex items-baseline gap-2">
                <span className="text-base font-semibold text-gray-400 line-through">
                  {formatPkr(product.price)}
                </span>
                <span>{formatPkr(finalPrice)}</span>
              </p>
            ) : (
              <p className="text-2xl font-black">{formatPkr(product.price)}</p>
            )}
          </div>
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

          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={`${product._id}-size-${size}`}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`text-xs px-3 py-2 border font-semibold min-w-[2.5rem] ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => bumpQty(-1)}
                disabled={quantity <= 1}
                className="h-10 w-10 border border-gray-300 text-lg font-bold leading-none hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span className="min-w-[2.5rem] text-center text-base font-bold tabular-nums">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => bumpQty(1)}
                disabled={quantity >= maxSelectableQty}
                className="h-10 w-10 border border-gray-300 text-lg font-bold leading-none hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
              {product.stockQuantity > 0 && (
                <span className="text-xs text-gray-500">
                  {product.stockQuantity} in stock
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const qty = Math.max(1, Math.floor(quantity || 1));
                addToCart(product, selectedColor || "Default", mainImage, selectedSize, quantity);
                setQuantity(1);
                toast.success("Added to cart", {
                  description: `${product.name} · Qty ${qty}${selectedSize ? ` · Size ${selectedSize}` : ""}`,
                });
              }}
              className="w-full sm:w-auto bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => {
                const qty = Math.max(1, Math.floor(quantity || 1));
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
                toast.success("Going to checkout", {
                  description: `${product.name} × ${qty}`,
                });
                router.push("/checkout");
              }}
              className="w-full sm:w-auto border-2 border-black text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-200 pt-8">
        <TabbedProductSections productId={product._id} detailHtml={product.detail} />
      </div>
    </div>
  );
}

function TabbedProductSections({
  productId,
  detailHtml,
}: {
  productId: string;
  detailHtml: string;
}) {
  const [tab, setTab] = useState<"details" | "reviews">("details");
  const tabBtn =
    "px-4 py-3 text-sm font-black uppercase tracking-widest border-b-2 -mb-px transition-colors";
  return (
    <div>
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setTab("details")}
          className={`${tabBtn} ${
            tab === "details" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Product Details
        </button>
        <button
          type="button"
          onClick={() => setTab("reviews")}
          className={`${tabBtn} ${
            tab === "reviews" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Reviews
        </button>
      </div>

      {tab === "details" ? (
        detailHtml ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: detailHtml }} />
        ) : (
          <p className="text-gray-600 leading-relaxed">No detail content added yet.</p>
        )
      ) : (
        <ProductReviewsPanel productId={productId} />
      )}
    </div>
  );
}
