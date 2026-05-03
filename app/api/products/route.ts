import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

function parseCsv(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeColorVariants(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .map((variant) => {
      const v = variant as { color?: unknown; images?: unknown };
      return {
        color: String(v.color || "").trim(),
        images: Array.isArray(v.images)
          ? v.images.map((img) => String(img)).filter(Boolean)
          : [],
      };
    })
    .filter((v) => v.color);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const size = searchParams.get("size");
    const color = searchParams.get("color");
    const minPrice = Number(searchParams.get("minPrice") || 0);
    const maxPrice = Number(searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER);
    const sort = searchParams.get("sort") || "latest";

    const query: Record<string, unknown> = { isActive: true };
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (size) query.sizes = size;
    if (color) query.colors = color;
    if (search) query.name = { $regex: search, $options: "i" };
    query.price = { $gte: minPrice, $lte: maxPrice };

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "priceLow") sortQuery = { price: 1 };
    if (sort === "priceHigh") sortQuery = { price: -1 };
    if (sort === "popular") sortQuery = { popularityScore: -1, soldCount: -1 };

    const products = await Product.find(query).sort(sortQuery).lean();
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
    const colorVariants = normalizeColorVariants(body.colorVariants);
    const colors =
      colorVariants.length > 0
        ? colorVariants.map((v) => v.color)
        : Array.isArray(body.colors)
        ? body.colors
        : parseCsv(body.colors);
    const images =
      colorVariants.flatMap((v) => v.images).filter(Boolean).length > 0
        ? colorVariants.flatMap((v) => v.images).filter(Boolean)
        : Array.isArray(body.images)
        ? body.images
        : [];

    const product = new Product({
      name: body.name,
      price: Number(body.price || 0),
      description: body.description || "",
      detail: body.detail || "",
      category: body.category || "",
      sizes: Array.isArray(body.sizes) ? body.sizes : parseCsv(body.sizes),
      colors,
      colorVariants,
      stockQuantity: Number(body.stockQuantity || 0),
      images,
      brand: body.brand || "",
      discount: Number(body.discount || 0),
      metaTitle: body.metaTitle || "",
      metaDescription: body.metaDescription || "",
      inStock: Number(body.stockQuantity || 0) > 0,
      isActive: body.isActive !== false,
    });
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
