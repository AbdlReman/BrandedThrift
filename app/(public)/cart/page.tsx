"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CartItem } from "@/types/product";
import { formatPkr } from "@/lib/formatCurrency";

const COUPONS: Record<string, number> = {
  THRIFT20: 20,
  SAVE10: 10,
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("cart_items") || "[]");
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discountRate = COUPONS[appliedCoupon] || 0;
  const discountAmount = subtotal * (discountRate / 100);
  const total = subtotal - discountAmount;

  const saveItems = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem("cart_items", JSON.stringify(next));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const next = items.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    saveItems(next);
  };

  const removeItem = (productId: string) => saveItems(items.filter((item) => item.productId !== productId));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black uppercase mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 border">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="border p-4 flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover bg-gray-100" />
                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.color} {item.size ? `· ${item.size}` : ""}</p>
                  <p className="font-semibold mt-1">{formatPkr(item.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <input type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(item.productId, Number(e.target.value || 1))} className="w-16 border px-2 py-1" />
                    <button onClick={() => removeItem(item.productId)} className="text-red-600 text-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border p-5 h-fit">
            <h2 className="font-black uppercase mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span>Subtotal</span><span>{formatPkr(subtotal)}</span></p>
              <p className="flex justify-between"><span>Discount</span><span>-{formatPkr(discountAmount)}</span></p>
              <p className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPkr(total)}</span></p>
            </div>
            <div className="mt-4">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="border px-3 py-2 w-full" placeholder="Coupon Code" />
              <button onClick={() => setAppliedCoupon(couponCode)} className="w-full mt-2 border border-black py-2 text-sm font-bold uppercase">Apply Coupon</button>
            </div>
            <Link href={`/checkout?coupon=${appliedCoupon}`} className="block mt-5 bg-black text-white text-center py-2 font-bold uppercase text-sm">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
