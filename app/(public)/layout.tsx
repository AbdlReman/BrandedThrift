import type { Metadata } from "next";
import Script from "next/script";
import "../globals.css";
import PublicChrome from "@/components/PublicChrome";

export const metadata: Metadata = {
  title: "Branded Thrift | Premium Shoes",
  description: "Shop the latest collection of premium branded shoes at Branded Thrift.",
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
