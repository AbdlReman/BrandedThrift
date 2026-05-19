import type { Metadata } from "next";
import LegalPage, { type PolicySection } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | Branded Thrift",
  description: "Read Branded Thrift terms for orders, shipping, exchanges, product authenticity, and website use.",
};

const sections: PolicySection[] = [
  {
    title: "1. About Branded Thrift",
    paragraphs: [
      "Branded Thrift is an online preloved footwear store based in Pakistan. We specialize in carefully selected original sneakers and footwear offered at reasonable prices.",
      "We are an independent reseller of preloved products.",
      "Branded Thrift is not affiliated, associated, authorized, endorsed by, or officially connected with any shoe or fashion brand displayed on our platform.",
      "All trademarks, logos, and brand names belong to their respective owners.",
    ],
  },
  {
    title: "2. Product Authenticity",
    paragraphs: [
      "We aim to provide accurate product descriptions, images, and condition details for every item listed.",
      "All products sold on Branded Thrift are original/authentic, preloved/previously owned, and carefully selected before listing.",
      "As products are preloved, minor signs of wear may be present and will be mentioned or visible in product photos whenever applicable.",
    ],
  },
  {
    title: "3. Orders & Acceptance",
    paragraphs: [
      "Once an order is placed and confirmed, it is considered final.",
      "In certain situations, we may contact customers regarding product availability, order verification, shipping issues, or unexpected circumstances affecting the order.",
      "We reserve the right to cancel or refuse orders when necessary.",
    ],
  },
  {
    title: "4. Pricing",
    paragraphs: ["All prices displayed on the website are listed in PKR.", "Branded Thrift reserves the right to:"],
    items: [
      "Update product prices at any time",
      "Correct pricing errors",
      "Cancel orders affected by incorrect pricing or technical issues",
    ],
  },
  {
    title: "5. Shipping & Delivery",
    paragraphs: [
      "We currently offer free delivery all over Pakistan.",
      "Estimated delivery time is 3-5 working days.",
      "Delivery times may vary due to courier delays, weather conditions, public holidays, or operational issues beyond our control.",
    ],
  },
  {
    title: "6. Size & Product Responsibility",
    paragraphs: ["Customers are responsible for carefully reviewing:"],
    items: [
      "Product descriptions",
      "Product condition",
      "Product measurements/sizing",
      "Photos before placing an order",
      "Selected size before confirming purchase",
      "Actual product colors may vary slightly due to lighting, photography, or screen settings",
    ],
  },
  {
    title: "7. Exchange Policy",
    paragraphs: [
      "Branded Thrift follows an exchange-only policy.",
      "We do not offer full cash refunds unless required by applicable law.",
      "Please refer to our Exchange Policy page for detailed information regarding exchanges and eligibility.",
    ],
  },
  {
    title: "8. Intellectual Property",
    paragraphs: [
      "All website content including images, text, graphics, branding, and layouts is the property of Branded Thrift unless otherwise stated.",
      "Users may not copy website content, reuse product photos, reproduce branding materials, or misuse the website or its content without permission.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    paragraphs: ["Branded Thrift is not responsible for:"],
    items: [
      "Indirect or incidental damages",
      "Delays caused by courier services",
      "Customer sizing mistakes",
      "Minor condition expectations already disclosed in listings",
      "By purchasing from our store, customers acknowledge the nature of preloved products",
    ],
  },
  {
    title: "10. Changes to Terms",
    paragraphs: [
      "We reserve the right to update or modify these Terms of Service at any time without prior notice.",
      "Continued use of the website after changes indicates acceptance of updated terms.",
    ],
  },
  {
    title: "11. Governing Law",
    paragraphs: ["These Terms of Service shall be governed and interpreted under the laws of Pakistan."],
  },
  {
    title: "12. Contact Us",
    paragraphs: [
      "For any questions regarding these Terms of Service, contact us at support@brandedthrift.store or WhatsApp +92 314 0151948.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      eyebrow="Terms & Conditions"
      lastUpdated="May 2026"
      intro={[
        "Welcome to Branded Thrift. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service.",
        "Please read these terms carefully before placing an order.",
      ]}
      sections={sections}
    />
  );
}
