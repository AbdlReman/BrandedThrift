"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h8.25V3H3v10.5Zm0 7.5h8.25v-4.5H3V21Zm9.75 0H21V10.5h-8.25V21Zm0-12H21V3h-8.25v6Z" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M6.75 3.75v3m10.5-3v3M5.25 10.5h13.5M6 20.25h12a2.25 2.25 0 0 0 2.25-2.25v-8.25H3.75V18A2.25 2.25 0 0 0 6 20.25Z" />
      </svg>
    ),
  },
  {
    href: "/admin/products/new",
    label: "Add Product",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <aside className="w-16 lg:w-64 bg-slate-800 flex flex-col flex-shrink-0 border-r border-slate-700">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm">BT</span>
        </div>
        <span className="ml-3 font-black text-sm uppercase tracking-widest text-white hidden lg:block">
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 flex flex-col gap-1 px-2">
        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold px-2 mb-2 hidden lg:block">
          Manage
        </p>
        {navLinks.map((link) => {
          const active =
            link.href === "/admin/products"
              ? pathname === "/admin/products" || pathname.startsWith("/admin/products/")
              : link.href === "/admin"
              ? pathname === "/admin"
              : pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {link.icon}
              <span className="hidden lg:block">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-2 py-4 border-t border-slate-700 flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="hidden lg:block">View Store</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full text-left"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </aside>
  );
}
