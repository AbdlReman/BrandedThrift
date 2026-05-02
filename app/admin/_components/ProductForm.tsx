"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";
import type { IProduct } from "@/types/product";

const BRANDS = ["PUMA", "NIKE", "ADIDAS", "NEW BALANCE", "REEBOK"] as const;
const CATEGORIES = ["Running", "Lifestyle", "Training"] as const;

interface ProductFormProps {
  initialData?: IProduct;
  mode: "create" | "edit";
}

const EMPTY = {
  name: "",
  brand: "PUMA" as IProduct["brand"],
  category: "Running" as IProduct["category"],
  price: "" as unknown as number,
  originalPrice: "" as unknown as number,
  color: "",
  shortDescription: "",
  longDescription: "",
  images: [] as string[],
  inStock: true,
  metaTitle: "",
  metaDescription: "",
};

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(
    initialData
      ? {
          name: initialData.name,
          brand: initialData.brand,
          category: initialData.category,
          price: initialData.price,
          originalPrice: initialData.originalPrice,
          color: initialData.color,
          shortDescription: initialData.shortDescription,
          longDescription: initialData.longDescription,
          images: initialData.images,
          inStock: initialData.inStock,
          metaTitle: initialData.metaTitle || "",
          metaDescription: initialData.metaDescription || "",
        }
      : EMPTY
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const url =
        mode === "create" ? "/api/products" : `/api/products/${initialData!._id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-500";
  const labelClass = "block text-slate-300 text-xs font-semibold uppercase tracking-widest mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Product Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Velocity Runner Pro"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Brand *</label>
            <select
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              className={inputClass}
              required
            >
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass}
              required
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Price ($) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set("price", parseFloat(e.target.value))}
              placeholder="99.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Original Price ($) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.originalPrice}
              onChange={(e) => set("originalPrice", parseFloat(e.target.value))}
              placeholder="149.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Color / Variant *</label>
            <input
              type="text"
              required
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              placeholder="e.g. Black / White"
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-widest">
              In Stock
            </label>
            <button
              type="button"
              onClick={() => set("inStock", !form.inStock)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                form.inStock ? "bg-indigo-600" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.inStock ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${form.inStock ? "text-green-400" : "text-slate-500"}`}>
              {form.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
          Descriptions
        </h2>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Short Description * (plain text, max 500 chars)</label>
            <textarea
              required
              rows={3}
              maxLength={500}
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="Brief product summary shown in listings…"
              className={`${inputClass} resize-none`}
            />
            <p className="text-slate-500 text-xs mt-1">{form.shortDescription.length}/500</p>
          </div>

          <div>
            <label className={labelClass}>Long Description * (rich text)</label>
            <RichTextEditor
              value={form.longDescription}
              onChange={(content) => set("longDescription", content)}
            />
          </div>
        </div>
      </div>

      {/* SEO Metadata */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
          SEO Metadata
        </h2>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Meta Title (optional, max 60 chars)</label>
            <input
              type="text"
              maxLength={60}
              value={form.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder="e.g. PUMA Velocity Runner Pro - Best Running Shoes"
              className={inputClass}
            />
            <p className="text-slate-500 text-xs mt-1">{form.metaTitle.length}/60</p>
          </div>

          <div>
            <label className={labelClass}>Meta Description (optional, max 160 chars)</label>
            <textarea
              rows={3}
              maxLength={160}
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              placeholder="e.g. Experience ultimate comfort and performance with the PUMA Velocity Runner Pro. Perfect for serious runners."
              className={`${inputClass} resize-none`}
            />
            <p className="text-slate-500 text-xs mt-1">{form.metaDescription.length}/160</p>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
          Product Images
        </h2>
        <ImageUploader
          initialUrls={initialData?.images}
          onChange={(urls) => set("images", urls)}
        />
      </div>

      {/* Error & Submit */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading
            ? "Saving…"
            : mode === "create"
            ? "Create Product"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
