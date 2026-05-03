"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export default function CheckoutPage() {
  const router = useRouter();
  const [items] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("cart_items") || "[]");
  });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const urlCouponDone = useRef(false);

  const applyCoupon = useCallback(async (code: string) => {
    const raw = code.trim().toUpperCase();
    if (!raw) {
      setAppliedCoupon("");
      setDiscountPercent(0);
      return;
    }
    const data = await validateCouponCode(raw);
    if (!data.valid) {
      toast.error("Coupon not applied", { description: data.error || "Invalid code." });
      setAppliedCoupon("");
      setDiscountPercent(0);
      return;
    }
    setAppliedCoupon(data.code || raw);
    setDiscountPercent(Number(data.discountPercent || 0));
    toast.success("Coupon applied", { description: `${data.code} · ${data.discountPercent}% off` });
  }, []);

  useEffect(() => {
    if (urlCouponDone.current || typeof window === "undefined") return;
    const param = new URLSearchParams(window.location.search).get("coupon")?.trim();
    if (!param) return;
    urlCouponDone.current = true;
    setCouponInput(param.toUpperCase());
    void applyCoupon(param);
  }, [applyCoupon]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discountAmount = useMemo(
    () => discountFromPercent(subtotal, discountPercent),
    [subtotal, discountPercent]
  );
  const totalAmount = useMemo(
    () => Math.round((subtotal - discountAmount) * 100) / 100,
    [subtotal, discountAmount]
  );

  const emptyWarned = useRef(false);
  useEffect(() => {
    if (items.length > 0 || emptyWarned.current) return;
    emptyWarned.current = true;
    toast.warning("Your cart is empty", {
      description: "Browse the shop and add products before checking out.",
    });
  }, [items.length]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Cannot place order", { description: "Your cart is empty." });
      return;
    }
    setLoading(true);
    toast.loading("Placing your order…", { id: "place-order" });
    let res: Response;
    try {
      res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          subtotal,
          discountAmount,
          totalAmount,
          couponCode: appliedCoupon,
        }),
      });
    } catch {
      toast.dismiss("place-order");
      setLoading(false);
      toast.error("Network error", { description: "Could not reach the server. Try again." });
      return;
    }
    const data = await res.json();
    setLoading(false);
    toast.dismiss("place-order");
    if (!res.ok) {
      toast.error("Order failed", { description: data.error || "Please try again." });
      return;
    }
    localStorage.removeItem("cart_items");
    window.dispatchEvent(new Event("cart_updated"));
    const orderNo = data.order?.orderNumber ?? "confirmed";
    toast.success("Order placed", {
      description: `Order ${orderNo}. Thank you for your purchase.`,
      duration: 3000,
    });
    router.push("/shop");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black uppercase mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={onSubmit} className="lg:col-span-2 border p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Customer Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="border px-3 py-2" />
            <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="border px-3 py-2" />
          </div>
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="border px-3 py-2 w-full" />
          <input required placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="border px-3 py-2 w-full" />
          <input required placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="border px-3 py-2 w-full" />
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="border px-3 py-2 w-full" rows={4} />
          <button disabled={loading} className="bg-black text-white px-5 py-2 text-sm font-bold uppercase">
            {loading ? "Placing..." : "Place Order"}
          </button>
        </form>

        <div className="border p-5 h-fit space-y-4">
          <h2 className="font-black uppercase mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <p className="flex justify-between">
              <span>Items</span>
              <span>{items.length}</span>
            </p>
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPkr(subtotal)}</span>
            </p>
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-500">Coupon code</label>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  className="flex-1 border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void applyCoupon(couponInput)}
                  className="border border-black px-3 py-2 text-xs font-bold uppercase whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon ? (
                <button
                  type="button"
                  className="text-xs text-gray-500 underline"
                  onClick={() => {
                    setAppliedCoupon("");
                    setDiscountPercent(0);
                    setCouponInput("");
                    toast.message("Coupon removed");
                  }}
                >
                  Remove coupon
                </button>
              ) : null}
            </div>
            <p className="flex justify-between">
              <span>Coupon</span>
              <span>{appliedCoupon || "—"}</span>
            </p>
            <p className="flex justify-between">
              <span>Discount{discountPercent ? ` (${discountPercent}%)` : ""}</span>
              <span>-{formatPkr(discountAmount)}</span>
            </p>
            <p className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPkr(totalAmount)}</span>
            </p>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            {items.map((i) => (
              <p key={`${i.productId}-${i.size}-${i.color}`}>
                {i.name}
                {(i.color || i.size) && (
                  <span className="text-gray-500">
                    {" "}
                    · {i.color || "—"} / {i.size || "—"}
                  </span>
                )}{" "}
                ×{i.quantity}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
