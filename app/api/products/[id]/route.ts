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
    const product = await Product.findByIdAndUpdate(id, body, {
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
