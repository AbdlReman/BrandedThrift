"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IProduct } from "@/types/product";

interface ProductTableProps {
  products: IProduct[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-16 text-center">
        <p className="text-5xl mb-4">📦</p>
        <p className="text-slate-400 font-medium mb-2">No products yet</p>
        <p className="text-slate-500 text-sm mb-6">Add your first product to get started.</p>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Add Product
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700/60 text-slate-400 text-xs uppercase tracking-widest">
              <th className="text-left px-4 py-3">Image</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Brand</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-slate-700/30 transition-colors">
                {/* Image */}
                <td className="px-4 py-3">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-600"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-lg">
                      👟
                    </div>
                  )}
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-100 max-w-[180px] truncate">{product.name}</p>
                  <p className="text-slate-500 text-xs">{product.color}</p>
                </td>

                {/* Brand */}
                <td className="px-4 py-3">
                  <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded">
                    {product.brand}
                  </span>
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-slate-400">{product.category}</td>

                {/* Price */}
                <td className="px-4 py-3">
                  <p className="font-bold text-white">${product.price}</p>
                  <p className="text-slate-500 text-xs line-through">${product.originalPrice}</p>
                </td>

                {/* Stock */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.inStock
                        ? "bg-green-900/60 text-green-300"
                        : "bg-red-900/60 text-red-300"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      disabled={deletingId === product._id}
                      className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {deletingId === product._id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
