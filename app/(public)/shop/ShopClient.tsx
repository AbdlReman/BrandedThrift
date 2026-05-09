"use client";

import { useMemo, useState, useTransition } from "react";
import Breadcrumbs from "@/components/shop/Breadcrumbs";
import ProductCard from "@/components/shop/ProductCard";
import ShopPagination from "@/components/shop/ShopPagination";
import type { IProduct } from "@/types/product";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORTS = [
  { value: "latest", label: "Newest" },
  { value: "priceLow", label: "Price: Low to high" },
  { value: "priceHigh", label: "Price: High to low" },
  { value: "popular", label: "Popular" },
];

const PAGE_SIZE = 12;

const filterInputClass =
  "w-full border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-black outline-none " +
  "placeholder:text-neutral-400 focus:border-neutral-500";

const selectClass =
  filterInputClass +
  " cursor-pointer appearance-none bg-[length:0.9rem] bg-[right_0.5rem_center] bg-no-repeat pr-8 " +
  "[background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23000000'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")]";

const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-500";

function categoriesOf(product: IProduct): string[] {
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    return product.categories.map(String).map((v) => v.trim()).filter(Boolean);
  }
  return product.category ? [product.category] : [];
}

export default function ShopClient({ products }: { products: IProduct[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requestedCategory = searchParams.get("category");

  const categories = useMemo(() => {
    const rest = Array.from(new Set(products.flatMap((p) => categoriesOf(p)).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...rest];
  }, [products]);
  const brands = useMemo(() => {
    const rest = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...rest];
  }, [products]);
  const sizes = useMemo(() => {
    const rest = Array.from(new Set(products.flatMap((p) => p.sizes).map(String))).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb) && a === String(na) && b === String(nb)) return na - nb;
      return a.localeCompare(b, undefined, { numeric: true });
    });
    return ["All", ...rest];
  }, [products]);
  const colors = useMemo(() => {
    const rest = Array.from(new Set(products.flatMap((p) => p.colors).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...rest];
  }, [products]);

  const category =
    requestedCategory && categories.includes(requestedCategory) ? requestedCategory : "All";

  const [brand, setBrand] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [, startTransition] = useTransition();

  const setCategory = (next: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "All") params.delete("category");
    else params.set("category", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const setBrandFilter = (v: string) => {
    setPage(1);
    setBrand(v);
  };
  const setSizeFilter = (v: string) => {
    setPage(1);
    setSize(v);
  };
  const setColorFilter = (v: string) => {
    setPage(1);
    setColor(v);
  };
  const setSearchFilter = (v: string) => {
    setPage(1);
    setSearch(v);
  };
  const setSortFilter = (v: string) => {
    setPage(1);
    setSort(v);
  };

  const filtered = useMemo(() => {
    return products
      .filter((p) => category === "All" || categoriesOf(p).includes(category))
      .filter((p) => brand === "All" || p.brand === brand)
      .filter((p) => size === "All" || p.sizes.includes(size))
      .filter((p) => color === "All" || p.colors.includes(color))
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === "priceLow") return a.price - b.price;
        if (sort === "priceHigh") return b.price - a.price;
        if (sort === "popular") return b.popularityScore - a.popularityScore;
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
  }, [products, category, brand, size, color, search, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const resetFilters = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
      setBrand("All");
      setSize("All");
      setColor("All");
      setSearch("");
      setSort("latest");
      setPage(1);
    });
  };

  const activeFilters =
    (category !== "All" ? 1 : 0) +
    (brand !== "All" ? 1 : 0) +
    (size !== "All" ? 1 : 0) +
    (color !== "All" ? 1 : 0) +
    (search.trim() !== "" ? 1 : 0);

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-neutral-200 bg-black text-white">
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            className="text-neutral-400 [&_a]:text-white [&_a:hover]:underline [&_span]:text-neutral-500"
            items={[
              { label: "Home", href: "/" },
              { label: "Shop" },
            ]}
          />
          <h1 className="mt-6 text-3xl font-black uppercase tracking-tight sm:text-4xl">Shop</h1>
          <p className="mt-2 text-sm text-neutral-400">{filtered.length} products</p>
        </div>
      </header>

      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-neutral-100 pb-2.5">
            <h2 className="text-sm font-black uppercase tracking-wide">Filters</h2>
            {activeFilters > 0 ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 underline"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-end gap-2.5">
            <div className="min-w-[11rem] flex-1 sm:flex-none sm:w-[14rem]">
              <label htmlFor="filter-search" className={labelClass}>Search</label>
              <input
                id="filter-search"
                value={search}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search"
                className={filterInputClass}
              />
            </div>
            <div className="min-w-[9rem] flex-1 sm:flex-none sm:w-[10rem]">
              <label htmlFor="filter-category" className={labelClass}>Style</label>
              <select id="filter-category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                {categories.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[8rem] flex-1 sm:flex-none sm:w-[9rem]">
              <label htmlFor="filter-brand" className={labelClass}>Brand</label>
              <select id="filter-brand" value={brand} onChange={(e) => setBrandFilter(e.target.value)} className={selectClass}>
                {brands.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[7rem] flex-1 sm:flex-none sm:w-[8rem]">
              <label htmlFor="filter-size" className={labelClass}>Size</label>
              <select id="filter-size" value={size} onChange={(e) => setSizeFilter(e.target.value)} className={selectClass}>
                {sizes.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[8rem] flex-1 sm:flex-none sm:w-[9rem]">
              <label htmlFor="filter-color" className={labelClass}>Color</label>
              <select id="filter-color" value={color} onChange={(e) => setColorFilter(e.target.value)} className={selectClass}>
                {colors.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-600" aria-live="polite">
              {filtered.length} products
              {category !== "All" ? ` · ${category}` : ""}
            </p>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="shop-sort-main">
                Sort
              </label>
              <select
                id="shop-sort-main"
                value={sort}
                onChange={(e) =>
                  startTransition(() => {
                    setSortFilter(e.target.value);
                  })
                }
                className={`${selectClass} sm:min-w-[12rem]`}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center border border-black bg-black px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 sm:min-w-[7rem]"
              >
                Cart
              </Link>
            </div>
          </div>

          <div>
            {paginated.length === 0 ? (
              <div className="border border-dashed border-neutral-300 px-6 py-16 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-black">No products found</p>
                <p className="mt-2 text-sm text-neutral-600">Try changing filters or search.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 border border-black bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {paginated.map((product, idx) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onOpenImage={(src, alt) => setPreviewImage({ src, alt })}
                    priority={safePage === 1 && idx < 4}
                  />
                ))}
              </div>
            )}
          </div>

          <ShopPagination
            page={safePage}
            pageCount={pageCount}
            totalItems={filtered.length}
            onPageChange={(p) =>
              startTransition(() => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              })
            }
          />
        </div>
      </div>

      {previewImage ? (
        <button
          type="button"
          className="fixed inset-0 z-[90] flex cursor-zoom-out items-center justify-center bg-black/85 p-4"
          onClick={() => setPreviewImage(null)}
          aria-label="Close preview"
        >
          <span
            className="absolute right-4 top-4 border border-white px-3 py-1 text-sm font-bold uppercase tracking-wider text-white"
            onClick={(e) => e.stopPropagation()}
          >
            Close
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage.src}
            alt={previewImage.alt}
            className="max-h-[90vh] max-w-[92vw] bg-white object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      ) : null}
    </div>
  );
}
