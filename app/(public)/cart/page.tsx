"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { CartItem } from "@/types/product";
import { discountFromPercent } from "@/lib/couponValidation";
import { formatPkr } from "@/lib/formatCurrency";

async function validateCouponCode(code: string) {
  const res = await fetch("/api/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return res.json() as Promise<{
    valid: boolean;
    code?: string;
    discountPercent?: number;
    error?: string;
  }>;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("cart_items") || "[]");
  });
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applying, setApplying] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discountAmount = useMemo(
    () => discountFromPercent(subtotal, discountPercent),
    [subtotal, discountPercent]
  );
  const total = useMemo(() => Math.round((subtotal - discountAmount) * 100) / 100, [subtotal, discountAmount]);

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

  const removeItem = (productId: string) => {
    const removed = items.find((i) => i.productId === productId);
    saveItems(items.filter((item) => item.productId !== productId));
    if (removed) toast.success("Removed from cart", { description: removed.name });
  };

  const handleApplyCoupon = async () => {
    setApplying(true);
    try {
      const data = await validateCouponCode(couponInput);
      if (!data.valid) {
        toast.error("Invalid coupon", { description: data.error || "Try another code." });
        setAppliedCoupon("");
        setDiscountPercent(0);
        return;
      }
      setAppliedCoupon(data.code || couponInput.trim().toUpperCase());
      setDiscountPercent(Number(data.discountPercent || 0));
      toast.success("Coupon applied", { description: `${data.code} · ${data.discountPercent}% off` });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black uppercase mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 border">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary">
            Continue Shopping
          </Link>
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
                  <p className="text-sm text-gray-500">
                    {item.color} {item.size ? `· ${item.size}` : ""}
                  </p>
                  <p className="font-semibold mt-1">{formatPkr(item.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, Number(e.target.value || 1))}
                      className="w-16 border px-2 py-1"
                    />
                    <button onClick={() => removeItem(item.productId)} className="text-red-600 text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border p-5 h-fit">
            <h2 className="font-black uppercase mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPkr(subtotal)}</span>
              </p>
              <p className="flex justify-between">
                <span>Discount{discountPercent ? ` (${discountPercent}%)` : ""}</span>
                <span>-{formatPkr(discountAmount)}</span>
              </p>
              <p className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatPkr(total)}</span>
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="border px-3 py-2 w-full"
                placeholder="Coupon code"
              />
              <button
                type="button"
                disabled={applying}
                onClick={() => void handleApplyCoupon()}
                className="w-full border border-black py-2 text-sm font-bold uppercase disabled:opacity-50"
              >
                {applying ? "Checking…" : "Apply coupon"}
              </button>
              {appliedCoupon ? (
                <button
                  type="button"
                  className="text-xs text-gray-500 underline w-full text-left"
                  onClick={() => {
                    setAppliedCoupon("");
                    setDiscountPercent(0);
                    setCouponInput("");
                  }}
                >
                  Remove {appliedCoupon}
                </button>
              ) : null}
            </div>
            <Link
              href={`/checkout?coupon=${encodeURIComponent(appliedCoupon)}`}
              onClick={() =>
                toast.success("Going to checkout", {
                  description: `${items.length} item group(s) · ${formatPkr(total)}`,
                })
              }
              className="block mt-5 bg-black text-white text-center py-2 font-bold uppercase text-sm"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
