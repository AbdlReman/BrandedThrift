"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop?category=Men", label: "Men" },
  { href: "/shop?category=Women", label: "Women" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const activeCategory = searchParams.get("category") || "";

  const collectionLinks = useMemo(
    () => collections.map((category) => ({ href: `/shop?category=${encodeURIComponent(category)}`, label: category })),
    [collections]
  );

  useEffect(() => {
    const sync = () => {
      const items = JSON.parse(localStorage.getItem("cart_items") || "[]");
      const count = items.reduce((sum: number, i: { quantity: number }) => sum + Number(i.quantity || 0), 0);
      setCartCount(count);
    };
    sync();
    window.addEventListener("cart_updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart_updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCollections(true);
      try {
        const res = await fetch("/api/navigation/collections");
        const data = await res.json();
        if (!cancelled) {
          setCollections(Array.isArray(data.categories) ? data.categories : []);
        }
      } catch {
        if (!cancelled) setCollections([]);
      } finally {
        if (!cancelled) setLoadingCollections(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isHome = pathname === "/";
  const isMen = pathname === "/shop" && activeCategory.toLowerCase() === "men";
  const isWomen = pathname === "/shop" && activeCategory.toLowerCase() === "women";
  const isCollectionsActive =
    pathname === "/shop" &&
    activeCategory !== "" &&
    activeCategory.toLowerCase() !== "men" &&
    activeCategory.toLowerCase() !== "women";

  const linkClass = (active: boolean) =>
    `nav-link text-zinc-100 hover:text-white transition-colors ${active ? "border-b-2 border-zinc-200" : ""}`;

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      {/* Top promo bar */}
      <div className="bg-zinc-900 text-zinc-100 text-center py-2 text-xs font-bold tracking-widest uppercase border-b border-zinc-800">
        We Deliver Free All Over Pakistan
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-100 rounded-sm flex items-center justify-center">
              <span className="text-zinc-900 font-black text-sm">BT</span>
            </div>
            <span className="font-black text-lg uppercase tracking-widest text-zinc-100">
              Branded<span className="text-zinc-300">Thrift</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {PRIMARY_LINKS.slice(0, 3).map((link) => {
              const active =
                link.label === "Home" ? isHome : link.label === "Men" ? isMen : isWomen;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(active)}
                >
                  {link.label}
                </Link>
              );
            })}

            <div
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                type="button"
                className={`${linkClass(isCollectionsActive)} inline-flex items-center gap-1`}
                onClick={() => setCollectionsOpen((prev) => !prev)}
                aria-expanded={collectionsOpen}
                aria-haspopup="menu"
              >
                Collections
                <span className="text-xs">▼</span>
              </button>

              {collectionsOpen && (
                <div className="absolute left-0 top-full mt-2 min-w-[13rem] rounded-md border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
                  {loadingCollections ? (
                    <p className="px-3 py-2 text-xs text-zinc-400">Loading...</p>
                  ) : collectionLinks.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-zinc-400">No collections</p>
                  ) : (
                    collectionLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block rounded px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800 ${
                          activeCategory.toLowerCase() === link.label.toLowerCase() ? "bg-zinc-800" : ""
                        }`}
                        onClick={() => setCollectionsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {PRIMARY_LINKS.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(pathname === link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <button aria-label="Search" className="hover:opacity-70 transition-opacity text-zinc-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Cart */}
            <Link href="/cart" aria-label="Cart" className="relative hover:opacity-70 transition-opacity text-zinc-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-zinc-100 text-zinc-900 text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden hover:opacity-70 transition-opacity text-zinc-100"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          <nav className="flex flex-col px-4 py-4 gap-4">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`nav-link text-sm py-1 text-zinc-100 hover:text-white transition-colors ${
                isHome ? "border-b-2 border-zinc-200 w-fit" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop?category=Men"
              onClick={() => setMenuOpen(false)}
              className={`nav-link text-sm py-1 text-zinc-100 hover:text-white transition-colors ${
                isMen ? "border-b-2 border-zinc-200 w-fit" : ""
              }`}
            >
              Men
            </Link>
            <Link
              href="/shop?category=Women"
              onClick={() => setMenuOpen(false)}
              className={`nav-link text-sm py-1 text-zinc-100 hover:text-white transition-colors ${
                isWomen ? "border-b-2 border-zinc-200 w-fit" : ""
              }`}
            >
              Women
            </Link>

            <button
              type="button"
              onClick={() => setMobileCollectionsOpen((prev) => !prev)}
              className={`nav-link text-left text-sm py-1 text-zinc-100 hover:text-white transition-colors ${
                isCollectionsActive ? "border-b-2 border-zinc-200 w-fit" : ""
              }`}
            >
              Collections ▼
            </button>
            {mobileCollectionsOpen && (
              <div className="ml-3 flex flex-col gap-2 border-l border-zinc-800 pl-3">
                {loadingCollections ? (
                  <p className="text-xs text-zinc-400">Loading...</p>
                ) : collectionLinks.length === 0 ? (
                  <p className="text-xs text-zinc-400">No collections</p>
                ) : (
                  collectionLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-sm text-zinc-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))
                )}
              </div>
            )}

            {PRIMARY_LINKS.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`nav-link text-sm py-1 text-zinc-100 hover:text-white transition-colors ${
                  pathname === link.href ? "border-b-2 border-zinc-200 w-fit" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
