import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const p = product as Record<string, unknown>;
    return NextResponse.json({
      product: { ...p, _id: String(p._id), createdAt: String(p.createdAt), updatedAt: String(p.updatedAt) },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const payload = {
      name: body.name,
      price: Number(body.price || 0),
      description: body.description || "",
      category: body.category || "",
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      colors: Array.isArray(body.colors) ? body.colors : [],
      stockQuantity: Number(body.stockQuantity || 0),
      images: Array.isArray(body.images) ? body.images : [],
      brand: body.brand || "",
      discount: Number(body.discount || 0),
      metaTitle: body.metaTitle || "",
      metaDescription: body.metaDescription || "",
      inStock: Number(body.stockQuantity || 0) > 0,
      isActive: body.isActive !== false,
    };
    const product = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const p = product as Record<string, unknown>;
    return NextResponse.json({
      product: { ...p, _id: String(p._id), createdAt: String(p.createdAt), updatedAt: String(p.updatedAt) },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
