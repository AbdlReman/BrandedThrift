import type { Metadata } from "next";
import Link from "next/link";
import ProductForm from "../../_components/ProductForm";

export const metadata: Metadata = { title: "Add Product — Admin" };

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest mb-3">
          <Link href="/admin/products" className="hover:text-slate-300 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-400">Add New</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Add Product</h1>
        <p className="text-slate-400 text-sm mt-1">Fill in the details to add a new product to the store.</p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
