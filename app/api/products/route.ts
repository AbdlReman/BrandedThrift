import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    const serialized = products.map((p: Record<string, unknown>) => ({
      ...p,
      _id: String(p._id),
      createdAt: String(p.createdAt),
      updatedAt: String(p.updatedAt),
    }));
    return NextResponse.json({ products: serialized });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const product = new Product(body);
    await product.save();
    return NextResponse.json(
      { product: { ...product.toObject(), _id: String(product._id) } },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/products error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
