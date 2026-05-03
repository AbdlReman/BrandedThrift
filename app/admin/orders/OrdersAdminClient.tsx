"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPkr } from "@/lib/formatCurrency";
import { paymentMethodLabel } from "@/lib/paymentLabels";

export type AdminOrderItem = {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
};

export type AdminOrderRow = {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    notes?: string;
  };
  items: AdminOrderItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string;
  paymentMethod: string;
  paymentTransactionId: string;
  paymentScreenshotUrl: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

export default function OrdersAdminClient({ orders }: { orders: AdminOrderRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = openId ? orders.find((o) => o._id === openId) : null;

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    },
    []
  );

  useEffect(() => {
    if (!openId) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openId, onKeyDown]);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
        <table className="w-full text-sm text-left text-slate-300 min-w-[720px]">
          <thead className="bg-slate-900/80 text-[10px] uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-4 py-3 font-bold">Order</th>
              <th className="px-4 py-3 font-bold">Customer</th>
              <th className="px-4 py-3 font-bold text-right">Total</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap">Date</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-800/80 align-middle">
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className="text-white font-semibold tabular-nums">{order.orderNumber}</span>
                </td>
                <td className="px-4 py-2.5 max-w-[280px]">
                  <p className="text-white font-medium truncate">{order.customer.name}</p>
                  <p className="text-slate-500 text-xs truncate">{order.customer.email}</p>
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-white tabular-nums whitespace-nowrap">
                  {formatPkr(order.totalAmount)}
                </td>
                <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap tabular-nums">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-xs">
                  <span className="text-slate-400">{order.paymentStatus}</span>
                  <span className="text-slate-600 mx-1">·</span>
                  <span className="text-slate-400">{order.orderStatus}</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setOpenId(order._id)}
                    className="text-xs font-bold uppercase tracking-wide text-cyan-400 hover:text-cyan-300"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
          onClick={() => setOpenId(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-600 bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-700 bg-slate-900/95 px-5 py-4 backdrop-blur">
              <div>
                <p id="order-modal-title" className="text-lg font-black uppercase tracking-tight text-white">
                  {selected.orderNumber}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-bold uppercase text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-6">
              <section>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Customer</h3>
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300 space-y-1">
                  <p className="text-white font-semibold">{selected.customer.name}</p>
                  <p>
                    <span className="text-slate-500">Email:</span> {selected.customer.email}
                  </p>
                  <p>
                    <span className="text-slate-500">Phone:</span> {selected.customer.phone}
                  </p>
                  <p>
                    <span className="text-slate-500">Address:</span> {selected.customer.address}, {selected.customer.city}
                  </p>
                  {selected.customer.notes ? (
                    <p className="text-slate-400 pt-2 border-t border-slate-700 mt-2">
                      <span className="text-slate-500">Notes:</span> {selected.customer.notes}
                    </p>
                  ) : null}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Payment</h3>
                <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-4 text-sm text-slate-200 space-y-2">
                  <p>
                    <span className="text-slate-500">Method:</span>{" "}
                    <span className="text-white font-medium">{paymentMethodLabel(selected.paymentMethod)}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Transaction ID / TRX ID:</span>{" "}
                    {selected.paymentTransactionId?.trim() ? (
                      <span className="text-white font-mono text-xs break-all">{selected.paymentTransactionId}</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </p>
                  {selected.paymentScreenshotUrl?.trim().startsWith("https://") ? (
                    <div className="pt-2">
                      <p className="text-slate-500 text-xs mb-2">Payment screenshot</p>
                      <a
                        href={selected.paymentScreenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 text-xs underline"
                      >
                        Open full image
                      </a>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selected.paymentScreenshotUrl}
                        alt="Payment proof"
                        className="mt-2 max-h-64 w-auto max-w-full rounded-lg border border-slate-600 object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No screenshot uploaded.</p>
                  )}
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                    Payment status: {selected.paymentStatus} · Order status: {selected.orderStatus}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Items</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="bg-slate-900/80 text-[10px] uppercase tracking-widest text-slate-500">
                      <tr>
                        <th className="px-3 py-2 w-12" />
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2 whitespace-nowrap">Color</th>
                        <th className="px-3 py-2 whitespace-nowrap">Size</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Each</th>
                        <th className="px-3 py-2 text-right">Line</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {selected.items.map((item, idx) => {
                        const qty = Math.max(1, Number(item.quantity || 1));
                        const line = Number(item.price || 0) * qty;
                        const color = (item.color || "").trim() || "—";
                        const size = (item.size || "").trim() || "—";
                        const img = (item.image || "").trim();
                        return (
                          <tr key={`${selected._id}-${idx}`} className="align-middle">
                            <td className="px-3 py-2">
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={img}
                                  alt=""
                                  className="h-10 w-10 object-cover rounded border border-slate-600"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-slate-700 border border-slate-600" />
                              )}
                            </td>
                            <td className="px-3 py-2 font-medium text-white max-w-[200px]">{item.name}</td>
                            <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{color}</td>
                            <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{size}</td>
                            <td className="px-3 py-2 text-center tabular-nums">{qty}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{formatPkr(Number(item.price || 0))}</td>
                            <td className="px-3 py-2 text-right font-semibold text-white tabular-nums">
                              {formatPkr(line)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-900/50 text-xs border-t border-slate-700">
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-right text-slate-500 uppercase tracking-widest">
                          Subtotal
                        </td>
                        <td className="px-3 py-2 text-right text-slate-200">{formatPkr(selected.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-right text-slate-500 uppercase tracking-widest">
                          Discount{selected.couponCode ? ` (${selected.couponCode})` : ""}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-200">-{formatPkr(selected.discountAmount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-right font-bold text-slate-300 uppercase tracking-widest">
                          Total
                        </td>
                        <td className="px-3 py-2 text-right font-black text-white">{formatPkr(selected.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
