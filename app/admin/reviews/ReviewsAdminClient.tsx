"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AdminReview = {
  _id: string;
  productId: string;
  productName: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type ProductOption = { _id: string; name: string };

export default function ReviewsAdminClient({ products }: { products: ProductOption[] }) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [newProductId, setNewProductId] = useState(products[0]?._id || "");
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newBody, setNewBody] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editBody, setEditBody] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setReviews(data.reviews || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (r: AdminReview) => {
    setEditingId(r._id);
    setEditAuthor(r.authorName);
    setEditRating(r.rating);
    setEditBody(r.body);
  };

  const cancelEdit = () => setEditingId(null);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: newProductId,
          authorName: newAuthor,
          rating: newRating,
          body: newBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setNewAuthor("");
      setNewBody("");
      setNewRating(5);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const saveEdit = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: editAuthor,
          rating: editRating,
          body: editBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    setError("");
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-10">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Add review</h2>
        <form onSubmit={submitCreate} className="space-y-4 max-w-3xl">
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">Product</label>
            <select
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-3 py-2.5 text-sm"
              required
            >
              {products.length === 0 ? (
                <option value="">No products</option>
              ) : (
                products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">Author name</label>
              <input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-3 py-2.5 text-sm"
                required
                maxLength={80}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">Rating</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-3 py-2.5 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase mb-1">Review</label>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={4}
              maxLength={2000}
              required
              className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-3 py-2.5 text-sm resize-y"
            />
          </div>
          <button
            type="submit"
            disabled={creating || products.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
          >
            {creating ? "Saving…" : "Create review"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">All reviews</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="text-slate-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="bg-slate-800 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3 min-w-[200px]">Review</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-900/40">
                {reviews.map((r) => (
                  <tr key={r._id} className="align-top">
                    {editingId === r._id ? (
                      <td colSpan={6} className="px-4 py-4 space-y-3">
                        <p className="text-xs text-slate-500">
                          Product:{" "}
                          <Link href={`/admin/products/${r.productId}/edit`} className="text-indigo-400 hover:underline">
                            {r.productName || r.productId}
                          </Link>
                        </p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <input
                            value={editAuthor}
                            onChange={(e) => setEditAuthor(e.target.value)}
                            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
                            maxLength={80}
                          />
                          <select
                            value={editRating}
                            onChange={(e) => setEditRating(Number(e.target.value))}
                            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
                          >
                            {[5, 4, 3, 2, 1].map((n) => (
                              <option key={n} value={n}>
                                {n} stars
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={3}
                          maxLength={2000}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(r._id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="border border-slate-600 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <span className="text-slate-400 line-clamp-2">{r.productName || "—"}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{r.authorName}</td>
                        <td className="px-4 py-3">{r.rating}★</td>
                        <td className="px-4 py-3 text-slate-400 max-w-xs whitespace-pre-wrap line-clamp-4">
                          {r.body}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            className="text-indigo-400 text-xs font-semibold uppercase"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(r._id)}
                            className="text-red-400 text-xs font-semibold uppercase"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
