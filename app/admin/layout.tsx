import type { Metadata } from "next";
import "../globals.css";
import AdminSidebar from "./_components/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin — Branded Thrift",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-900 text-slate-100 antialiased flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-full overflow-auto">
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
