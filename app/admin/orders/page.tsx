import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { formatPkr } from "@/lib/formatCurrency";
import Order from "@/models/Order";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

type OrderItem = {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
};

export default async function AdminOrdersPage() {
  await connectDB();
  const raw = await Order.find({}).sort({ createdAt: -1 }).lean();
  const orders = (raw as Record<string, unknown>[]).map((o) => ({
    _id: String(o._id),
    orderNumber: String(o.orderNumber),
    customer: o.customer as {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      notes?: string;
    },
    items: (Array.isArray(o.items) ? o.items : []) as OrderItem[],
    subtotal: Number(o.subtotal ?? 0),
    discountAmount: Number(o.discountAmount ?? 0),
    totalAmount: Number(o.totalAmount || 0),
    couponCode: String(o.couponCode || ""),
    paymentStatus: String(o.paymentStatus || "pending"),
    orderStatus: String(o.orderStatus || "pending"),
    createdAt: String(o.createdAt),
  }));

  return (
    <div>
      <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-6">Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-700">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{order.orderNumber}</p>
                <p className="text-slate-100 font-semibold text-lg mt-1">{order.customer.name}</p>
                <p className="text-slate-400 text-sm mt-1">{order.customer.email}</p>
                <p className="text-slate-400 text-sm">{order.customer.phone}</p>
                <p className="text-slate-300 text-sm mt-2">
                  {order.customer.address}, {order.customer.city}
                </p>
                {order.customer.notes ? (
                  <p className="text-slate-400 text-sm mt-2 italic">Notes: {order.customer.notes}</p>
                ) : null}
              </div>
              <div className="text-right space-y-1">
                <p className="text-white font-black text-xl">{formatPkr(order.totalAmount)}</p>
                {order.couponCode ? (
                  <p className="text-xs text-slate-400">Coupon: {order.couponCode}</p>
                ) : null}
                <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                <p className="text-xs text-slate-300">Payment: {order.paymentStatus}</p>
                <p className="text-xs text-slate-300">Fulfillment: {order.orderStatus}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-900/80 text-[10px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-4 py-3 w-14" />
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 whitespace-nowrap">Color</th>
                    <th className="px-4 py-3 whitespace-nowrap">Size</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Each</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Line</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {order.items.map((item, idx) => {
                    const qty = Math.max(1, Number(item.quantity || 1));
                    const line = Number(item.price || 0) * qty;
                    const color = (item.color || "").trim() || "—";
                    const size = (item.size || "").trim() || "—";
                    const img = (item.image || "").trim();
                    return (
                      <tr key={`${order._id}-${idx}-${item.name}`} className="align-middle">
                        <td className="px-4 py-3 w-14">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt=""
                              className="h-12 w-12 object-cover rounded border border-slate-600 bg-slate-900"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-slate-700 border border-slate-600" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-white max-w-[220px]">{item.name}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{color}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{size}</td>
                        <td className="px-4 py-3 text-center tabular-nums">{qty}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPkr(Number(item.price || 0))}</td>
                        <td className="px-4 py-3 text-right font-semibold text-white tabular-nums">
                          {formatPkr(line)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-900/50 text-xs border-t border-slate-700">
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-right text-slate-500 uppercase tracking-widest">
                      Subtotal
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-slate-200">{formatPkr(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-right text-slate-500 uppercase tracking-widest">
                      Discount
                    </td>
                    <td className="px-4 py-2 text-right text-slate-200">-{formatPkr(order.discountAmount)}</td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-slate-300 uppercase tracking-widest font-bold">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-black text-white text-sm">{formatPkr(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
