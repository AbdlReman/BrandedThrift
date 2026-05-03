import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { formatPkr } from "@/lib/formatCurrency";
import { sendOrderEmails } from "@/lib/mailer";

function makeOrderNumber() {
  return `BT-${Date.now().toString().slice(-8)}`;
}

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    const serialized = orders.map((o: Record<string, unknown>) => ({
      ...o,
      _id: String(o._id),
      createdAt: String(o.createdAt),
      updatedAt: String(o.updatedAt),
    }));
    return NextResponse.json({ orders: serialized });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { customer, items, subtotal, discountAmount, totalAmount, couponCode } = body;

    if (!customer?.name || !customer?.phone || !customer?.email || !customer?.address || !customer?.city) {
      return NextResponse.json({ error: "Missing customer fields" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    const order = await Order.create({
      orderNumber: makeOrderNumber(),
      customer,
      items,
      subtotal: Number(subtotal || 0),
      discountAmount: Number(discountAmount || 0),
      totalAmount: Number(totalAmount || 0),
      couponCode: couponCode || "",
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          stockQuantity: -Number(item.quantity || 1),
          soldCount: Number(item.quantity || 1),
          popularityScore: Number(item.quantity || 1),
        },
      });
    }

    const orderItemsHtml = items
      .map(
        (item: { name: string; quantity: number; price: number }) =>
          `<li>${item.name} x${item.quantity} - ${formatPkr(Number(item.price))}</li>`
      )
      .join("");

    const customerHtml = `
      <h2>Order Confirmation (${order.orderNumber})</h2>
      <p>Hi ${customer.name},</p>
      <p>Thank you for your order. We have received it and will process it soon.</p>
      <ul>${orderItemsHtml}</ul>
      <p><strong>Total:</strong> ${formatPkr(Number(totalAmount || 0))}</p>
    `;

    const adminHtml = `
      <h2>New Order ${order.orderNumber}</h2>
      <p><strong>Customer:</strong> ${customer.name} (${customer.email}, ${customer.phone})</p>
      <p><strong>Address:</strong> ${customer.address}, ${customer.city}</p>
      <ul>${orderItemsHtml}</ul>
      <p><strong>Total:</strong> ${formatPkr(Number(totalAmount || 0))}</p>
    `;

    if (process.env.ADMIN_EMAIL && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendOrderEmails({
        customerEmail: customer.email,
        adminEmail: process.env.ADMIN_EMAIL,
        subject: `Order ${order.orderNumber} confirmed`,
        customerHtml,
        adminHtml,
      });
    }

    return NextResponse.json({
      order: { ...order.toObject(), _id: String(order._id) },
      success: true,
    });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
