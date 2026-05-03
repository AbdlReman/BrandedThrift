"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CartItem } from "@/types/product";
import { formatPkr } from "@/lib/formatCurrency";

const COUPONS: Record<string, number> = {
  THRIFT20: 20,
  SAVE10: 10,
};

export default function CheckoutPage() {
  const router = useRouter();
  const [coupon] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("coupon") || "";
  });
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

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discountAmount = subtotal * ((COUPONS[coupon] || 0) / 100);
  const totalAmount = subtotal - discountAmount;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: form,
        items,
        subtotal,
        discountAmount,
        totalAmount,
        couponCode: coupon,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error || "Checkout failed");
      return;
    }
    localStorage.removeItem("cart_items");
    window.dispatchEvent(new Event("cart_updated"));
    alert(`Order placed: ${data.order.orderNumber}`);
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

        <div className="border p-5 h-fit">
          <h2 className="font-black uppercase mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <p className="flex justify-between"><span>Items</span><span>{items.length}</span></p>
            <p className="flex justify-between"><span>Subtotal</span><span>{formatPkr(subtotal)}</span></p>
            <p className="flex justify-between"><span>Coupon</span><span>{coupon || "-"}</span></p>
            <p className="flex justify-between"><span>Discount</span><span>-{formatPkr(discountAmount)}</span></p>
            <p className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPkr(totalAmount)}</span></p>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            {items.map((i) => (
              <p key={`${i.productId}-${i.size}-${i.color}`}>{i.name} x{i.quantity}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
