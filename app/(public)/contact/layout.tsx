import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Branded Shoes in Rawalpindi & Islamabad",
  description:
    "Get in touch with Branded Thrift — Pakistan's trusted store for authentic branded shoes in Rawalpindi, Islamabad & nationwide. WhatsApp, email or contact form.",
  alternates: { canonical: "https://www.brandedthrift.store/contact" },
  openGraph: {
    title: "Contact Branded Thrift | Branded Shoes in Pakistan",
    description:
      "Reach us on WhatsApp or email. Authentic branded shoes delivered free all over Pakistan.",
    url: "https://www.brandedthrift.store/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
