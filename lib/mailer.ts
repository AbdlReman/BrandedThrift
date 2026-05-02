import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderEmails({
  customerEmail,
  adminEmail,
  subject,
  customerHtml,
  adminHtml,
}: {
  customerEmail: string;
  adminEmail: string;
  subject: string;
  customerHtml: string;
  adminHtml: string;
}) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com";
  await Promise.all([
    transporter.sendMail({
      from,
      to: customerEmail,
      subject,
      html: customerHtml,
    }),
    transporter.sendMail({
      from,
      to: adminEmail,
      subject: `New Order Received - ${subject}`,
      html: adminHtml,
    }),
  ]);
}
