import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { sendOrderEmails } from "@/lib/mailer";
import {
  buildAdminOrderEmailHtml,
  buildCustomerOrderEmailHtml,
  getOrderNotificationEmail,
  smtpConfigured,
} from "@/lib/orderEmailHtml";

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

    const notifyEmail = getOrderNotificationEmail();
    const emailPayload = {
      orderNumber: String(order.orderNumber),
      customer: {
        name: String(customer.name),
        phone: String(customer.phone),
        email: String(customer.email),
        address: String(customer.address),
        city: String(customer.city),
        notes: String(customer.notes || ""),
      },
      items: items.map(
        (item: {
          productId?: string;
          name: string;
          quantity: number;
          price: number;
          color?: string;
          size?: string;
          image?: string;
        }) => ({
          productId: item.productId ? String(item.productId) : "",
          name: String(item.name || ""),
          quantity: Math.max(1, Number(item.quantity || 1)),
          price: Number(item.price || 0),
          color: item.color != null ? String(item.color) : "",
          size: item.size != null ? String(item.size) : "",
          image: item.image != null ? String(item.image) : "",
        })
      ),
      subtotal: Number(subtotal || 0),
      discountAmount: Number(discountAmount || 0),
      totalAmount: Number(totalAmount || 0),
      couponCode: String(couponCode || ""),
    };

    const customerHtml = buildCustomerOrderEmailHtml(emailPayload);
    const adminHtml = buildAdminOrderEmailHtml(emailPayload);

    if (smtpConfigured() && notifyEmail) {
      try {
        await sendOrderEmails({
          customerEmail: String(customer.email).trim(),
          adminEmail: notifyEmail,
          subject: `Order ${order.orderNumber} confirmed`,
          customerHtml,
          adminHtml,
        });
      } catch (mailErr) {
        console.error("Order email failed (order still saved):", mailErr);
      }
    } else {
      console.warn(
        "Order confirmation email skipped: set ADMIN_EMAIL (or ORDER_NOTIFY_EMAIL), SMTP_HOST, SMTP_USER, SMTP_PASS. Use Gmail App Password on port 587."
      );
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
