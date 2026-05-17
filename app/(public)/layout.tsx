import type { Metadata } from "next";
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
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
