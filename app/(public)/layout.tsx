import type { Metadata } from "next";
import Script from "next/script";
import "../globals.css";
import PublicChrome from "@/components/PublicChrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.brandedthrift.store"),
  title: {
    default: "Branded Thrift | Buy Branded Shoes in Pakistan",
    template: "%s | Branded Thrift",
  },
  description:
    "Buy 100% original branded shoes in Pakistan. Shop preloved Nike, Adidas, Puma & more in Rawalpindi, Islamabad & across Pakistan. Free delivery nationwide.",
  keywords: [
    "branded shoes Pakistan",
    "branded shoes in Rawalpindi",
    "branded shoes in Islamabad",
    "buy branded shoes online Pakistan",
    "preloved branded shoes",
    "thrifted branded shoes",
    "original Nike shoes Pakistan",
    "original Adidas shoes Pakistan",
    "original Puma shoes Pakistan",
    "cheap branded shoes Pakistan",
    "authentic branded shoes",
    "branded thrift",
    "shoes online Pakistan",
    "men shoes Pakistan",
    "women shoes Pakistan",
    "sneakers Pakistan",
  ],
  authors: [{ name: "Branded Thrift", url: "https://www.brandedthrift.store" }],
  creator: "Branded Thrift",
  publisher: "Branded Thrift",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://www.brandedthrift.store",
    siteName: "Branded Thrift",
    title: "Branded Thrift | Buy Branded Shoes in Pakistan",
    description:
      "Shop 100% original branded shoes in Rawalpindi, Islamabad & all over Pakistan. Nike, Adidas, Puma & more — free delivery nationwide.",
    images: [
      {
        url: "/images/hero.jpeg",
        width: 1200,
        height: 630,
        alt: "Branded Thrift — Authentic Branded Shoes in Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Branded Thrift | Buy Branded Shoes in Pakistan",
    description:
      "Shop 100% original branded shoes in Rawalpindi, Islamabad & all over Pakistan. Free delivery nationwide.",
    images: ["/images/hero.jpeg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PK" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y7DEMZ1WL5"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y7DEMZ1WL5');
          `}
        </Script>
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
