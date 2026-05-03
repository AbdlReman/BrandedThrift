import nodemailer from "nodemailer";

/** Prefer SMTP_*; fall back to Gmail-style EMAIL_USER / EMAIL_PASS from .env.local */
function smtpAuthUser() {
  return process.env.SMTP_USER?.trim() || process.env.EMAIL_USER?.trim();
}

function smtpAuthPass() {
  return process.env.SMTP_PASS?.trim() || process.env.EMAIL_PASS?.trim();
}

function smtpHost() {
  const h = process.env.SMTP_HOST?.trim();
  if (h) return h;
  return smtpAuthUser() ? "smtp.gmail.com" : "";
}

const transporter = nodemailer.createTransport({
  host: smtpHost() || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: {
    user: smtpAuthUser(),
    pass: smtpAuthPass(),
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
  const from =
    process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || process.env.EMAIL_USER?.trim() || "no-reply@example.com";
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

/** True when Nodemailer can authenticate (SMTP_* or EMAIL_USER + EMAIL_PASS). */
export function smtpCredentialsReady(): boolean {
  return Boolean(smtpAuthUser() && smtpAuthPass());
}

/** Inbox for order notifications and default contact inbox. Set `RECIPIENT_EMAIL` in `.env.local`. */
export function getRecipientInboxEmail(): string | undefined {
  return process.env.RECIPIENT_EMAIL?.trim() || undefined;
}

/** Contact form “to” address: optional separate inbox, otherwise same as `getRecipientInboxEmail()`. */
export function getContactNotifyEmail(): string | undefined {
  return process.env.CONTACT_NOTIFY_EMAIL?.trim() || getRecipientInboxEmail();
}

export async function sendContactNotification(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const from =
    process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || process.env.EMAIL_USER?.trim() || "no-reply@example.com";
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo || undefined,
  });
}
