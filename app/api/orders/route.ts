import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Coupon from "@/models/Coupon";
import {
  computeSubtotalFromOrderItems,
  discountFromPercent,
  isCouponUsable,
} from "@/lib/couponValidation";
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

const VALID_PAYMENT_METHODS = ["easypaisa", "sadapay", "meezan"] as const;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { customer, items, couponCode, payment } = body;

    if (!customer?.name || !customer?.phone || !customer?.email || !customer?.address || !customer?.city) {
      return NextResponse.json({ error: "Missing customer fields" }, { status: 400 });
    }

    const customerDoc = {
      name: String(customer.name).trim(),
      phone: String(customer.phone).trim(),
      email: String(customer.email).trim().toLowerCase(),
      address: String(customer.address).trim(),
      city: String(customer.city).trim(),
      state: String(customer.state ?? "").trim(),
      postalCode: String(customer.postalCode ?? "").trim(),
      notes: String(customer.notes ?? "").trim(),
    };

    const paymentMethod = String(payment?.method || "")
      .trim()
      .toLowerCase();
    const paymentTransactionId = String(payment?.transactionId || "").trim();
    const paymentScreenshotUrl = String(payment?.screenshotUrl || "").trim();

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod as (typeof VALID_PAYMENT_METHODS)[number])) {
      return NextResponse.json({ error: "Select a payment method." }, { status: 400 });
    }
    if (!paymentTransactionId && !paymentScreenshotUrl) {
      return NextResponse.json(
        {
          error:
            "Please provide either your Transaction ID or a payment screenshot (at least one is required).",
        },
        { status: 400 }
      );
    }
    if (paymentScreenshotUrl && !paymentScreenshotUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid payment screenshot link." }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    const serverSubtotal = computeSubtotalFromOrderItems(items);
    const codeRaw = String(couponCode || "").trim().toUpperCase();
    let discountAmount = 0;
    let couponCodeSaved = "";
    let couponIdToIncrement: string | null = null;

    if (codeRaw) {
      const couponDoc = await Coupon.findOne({ code: codeRaw }).lean();
      if (!couponDoc) {
        return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
      }
      const c = couponDoc as Record<string, unknown>;
      const lean = {
        _id: c._id,
        code: String(c.code || ""),
        discountPercent: Number(c.discountPercent || 0),
        isActive: Boolean(c.isActive !== false),
        validFrom: c.validFrom as Date | null,
        validUntil: c.validUntil as Date | null,
        maxUses: c.maxUses == null ? null : Number(c.maxUses),
        usedCount: Number(c.usedCount || 0),
      };
      if (!isCouponUsable(lean)) {
        return NextResponse.json(
          { error: "This coupon is inactive, expired, or has reached its usage limit." },
          { status: 400 }
        );
      }
      discountAmount = discountFromPercent(serverSubtotal, lean.discountPercent);
      couponCodeSaved = lean.code;
      couponIdToIncrement = String(c._id);
    }

    const totalAmount = Math.round((serverSubtotal - discountAmount) * 100) / 100;

    const order = await Order.create({
      orderNumber: makeOrderNumber(),
      customer: customerDoc,
      items,
      subtotal: serverSubtotal,
      discountAmount,
      totalAmount,
      couponCode: couponCodeSaved,
      paymentMethod,
      paymentTransactionId,
      paymentScreenshotUrl,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    if (couponIdToIncrement) {
      await Coupon.findByIdAndUpdate(couponIdToIncrement, { $inc: { usedCount: 1 } });
    }

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
        name: customerDoc.name,
        phone: customerDoc.phone,
        email: customerDoc.email,
        address: customerDoc.address,
        city: customerDoc.city,
        state: customerDoc.state,
        postalCode: customerDoc.postalCode,
        notes: customerDoc.notes,
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
      subtotal: serverSubtotal,
      discountAmount,
      totalAmount,
      couponCode: couponCodeSaved,
      payment: {
        methodCode: paymentMethod,
        transactionId: paymentTransactionId,
        screenshotUrl: paymentScreenshotUrl,
      },
    };

    const customerHtml = buildCustomerOrderEmailHtml(emailPayload);
    const adminHtml = buildAdminOrderEmailHtml(emailPayload);

    if (smtpConfigured() && notifyEmail) {
      try {
        await sendOrderEmails({
          customerEmail: customerDoc.email,
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
