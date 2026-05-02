import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await connectDB();
  const [ordersRaw, productsRaw] = await Promise.all([
    Order.find({}).sort({ createdAt: -1 }).lean(),
    Product.find({}).lean(),
  ]);

  const orders = ordersRaw as Record<string, unknown>[];
  const products = productsRaw as Record<string, unknown>[];

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => String(o.orderStatus) === "pending").length;
  const completedOrders = orders.filter((o) => String(o.orderStatus) === "completed").length;
  const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const lowStockProducts = products
    .filter((p) => Number(p.stockQuantity || 0) <= 5)
    .sort((a, b) => Number(a.stockQuantity || 0) - Number(b.stockQuantity || 0))
    .slice(0, 6);
  const bestSellers = products
    .sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0))
    .slice(0, 6);

  const salesByDay = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    const key = date.toISOString().slice(0, 10);
    const dayRevenue = orders
      .filter((o) => String(o.createdAt).slice(0, 10) === key)
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    return { key, revenue: dayRevenue };
  });
  const maxRevenue = Math.max(...salesByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Orders, revenue, and inventory overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: totalOrders },
          { label: "Pending Orders", value: pendingOrders },
          { label: "Completed Orders", value: completedOrders },
          { label: "Revenue", value: `$${revenue.toFixed(2)}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Sales Chart (7 days)</h2>
          <div className="flex items-end gap-3 h-48">
            {salesByDay.map((day) => (
              <div key={day.key} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-indigo-500/80 rounded-t" style={{ height: `${(day.revenue / maxRevenue) * 100}%` }} />
                <p className="text-[10px] text-slate-500 mt-2">{day.key.slice(5)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 6).map((o) => (
              <div key={String(o._id)} className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div>
                  <p className="text-slate-100 text-sm">{String((o.customer as { name: string })?.name || "Customer")}</p>
                  <p className="text-xs text-slate-500">{String(o.orderNumber || "")}</p>
                </div>
                <p className="text-sm font-semibold text-white">${Number(o.totalAmount || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Low Stock Alerts</h2>
          <div className="space-y-2">
            {lowStockProducts.map((p) => (
              <p key={String(p._id)} className="text-sm text-slate-300">
                {String(p.name)} - {Number(p.stockQuantity || 0)} left
              </p>
            ))}
            {lowStockProducts.length === 0 && <p className="text-sm text-slate-500">No low stock products.</p>}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Best Selling Products</h2>
          <div className="space-y-2">
            {bestSellers.map((p) => (
              <p key={String(p._id)} className="text-sm text-slate-300">
                {String(p.name)} - sold {Number(p.soldCount || 0)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
