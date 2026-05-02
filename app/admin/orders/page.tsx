import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

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
    items: o.items as { name: string; quantity: number; price: number }[],
    totalAmount: Number(o.totalAmount || 0),
    paymentStatus: String(o.paymentStatus || "pending"),
    orderStatus: String(o.orderStatus || "pending"),
    createdAt: String(o.createdAt),
  }));

  return (
    <div>
      <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-6">Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest">{order.orderNumber}</p>
                <p className="text-slate-100 font-semibold">{order.customer.name} · {order.customer.email}</p>
                <p className="text-slate-400 text-sm">{order.customer.phone} · {order.customer.address}, {order.customer.city}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-black">${order.totalAmount.toFixed(2)}</p>
                <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                <p className="text-xs text-slate-300">Payment: {order.paymentStatus}</p>
                <p className="text-xs text-slate-300">Order: {order.orderStatus}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-700 pt-3 space-y-1">
              {order.items.map((item, idx) => (
                <p key={`${order._id}-${idx}`} className="text-sm text-slate-300">
                  {item.name} x{item.quantity} - ${Number(item.price).toFixed(2)}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
