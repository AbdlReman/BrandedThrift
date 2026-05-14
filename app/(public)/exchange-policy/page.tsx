import type { Metadata } from "next";
import LegalPage, { type PolicySection } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Exchange Policy | Branded Thrift",
  description: "Review Branded Thrift exchange eligibility, shipping costs, and product availability terms.",
};

const sections: PolicySection[] = [
  {
    title: "1. Exchange Eligibility",
    paragraphs: ["Customers may request an exchange within 5 days after delivery if:"],
    items: [
      "The item received is significantly different from the product description",
      "The wrong item was delivered",
      "The product has an undisclosed issue",
    ],
  },
  {
    title: "2. No Refund Policy",
    paragraphs: ["Branded Thrift does not offer cash refunds or full payment returns."],
    items: [
      "Approved requests will only be processed as product exchange",
      "Store exchange option may be available, subject to availability",
    ],
  },
  {
    title: "3. Shipping Costs",
    paragraphs: ["For exchange requests:"],
    items: [
      "Customers are responsible for sending the product back to our address",
      "Return shipping costs must be covered by the customer",
      "We are not responsible for items lost during return shipping",
      "We recommend using a reliable courier service with tracking",
    ],
  },
  {
    title: "4. Product Availability",
    paragraphs: [
      "As we are a preloved store, most pairs are available in limited quantities and sizes.",
      "If your preferred size is unavailable during exchange, you may wait until a suitable pair becomes available or select another available pair from our collection.",
      "We cannot guarantee restocks of specific products or sizes.",
    ],
  },
  {
    title: "5. Condition for Exchange",
    paragraphs: ["To qualify for an exchange:"],
    items: [
      "The item must be returned in the same condition received",
      "The product must not be excessively used, damaged, or altered after delivery",
      "Original packaging, if provided, should be included",
    ],
  },
  {
    title: "6. Non-Exchangeable Situations",
    paragraphs: ["We may refuse exchanges if:"],
    items: [
      "The condition issue was already clearly shown or mentioned before purchase",
      "The product was damaged after delivery",
      "The customer changes their mind after purchase",
    ],
  },
  {
    title: "7. Contact Us",
    paragraphs: [
      "For exchange-related inquiries, contact us at hello@brandedthrift.com or WhatsApp +92 314 0151948.",
    ],
  },
];

export default function ExchangePolicyPage() {
  return (
    <LegalPage
      title="Exchange Policy"
      eyebrow="Exchange Policy"
      lastUpdated="May 2026"
      intro={[
        "At Branded Thrift, we specialize in carefully selected preloved footwear. Since every pair is unique and limited in availability, we currently offer an exchange-only policy and do not provide full refunds.",
        "By placing an order, you agree to the terms below.",
      ]}
      sections={sections}
    />
  );
}
