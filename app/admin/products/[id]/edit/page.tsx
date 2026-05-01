import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductForm from "../../../_components/ProductForm";
import type { IProduct } from "@/types/product";

export const metadata: Metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await connectDB();
  const raw = await Product.findById(id).lean();
  if (!raw) notFound();

  const p = raw as Record<string, unknown>;
  const product: IProduct = {
    _id: String(p._id),
    name: String(p.name),
    brand: p.brand as IProduct["brand"],
    category: p.category as IProduct["category"],
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
    color: String(p.color),
    shortDescription: String(p.shortDescription),
    longDescription: String(p.longDescription),
    images: (p.images as string[]) || [],
    inStock: Boolean(p.inStock),
    slug: String(p.slug || ""),
    createdAt: String(p.createdAt),
    updatedAt: String(p.updatedAt),
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest mb-3">
          <Link href="/admin/products" className="hover:text-slate-300 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-[200px]">{product.name}</span>
          <span>/</span>
          <span className="text-slate-400">Edit</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Edit Product</h1>
        <p className="text-slate-400 text-sm mt-1 truncate">{product.name}</p>
      </div>

      <ProductForm mode="edit" initialData={product} />
    </div>
  );
}
