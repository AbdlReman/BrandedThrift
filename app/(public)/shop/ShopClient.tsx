"use client";

import { useMemo, useState, useTransition } from "react";
import Breadcrumbs from "@/components/shop/Breadcrumbs";
import ProductCard from "@/components/shop/ProductCard";
import ShopPagination from "@/components/shop/ShopPagination";
import type { IProduct } from "@/types/product";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORTS = [
  { value: "latest", label: "Latest arrivals" },
  { value: "priceLow", label: "Price · Low to high" },
  { value: "priceHigh", label: "Price · High to low" },
  { value: "popular", label: "Most popular" },
];

const PAGE_SIZE = 12;

const filterInputClass =
  "w-full rounded-xl border border-neutral-200/90 bg-white/90 px-3.5 py-3 text-sm font-medium text-neutral-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition " +
  "placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/10";

const selectClass =
  filterInputClass +
  " cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-10 " +
  "[background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")]";

const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500";

export default function ShopClient({ products }: { products: IProduct[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requestedCategory = searchParams.get("category");

  const categories = useMemo(() => {
    const rest = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort((a, b) =>
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
      .filter((p) => category === "All" || p.category === category)
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
    <div className="min-h-screen bg-[#fafafa] text-neutral-950">
      <header className="relative overflow-hidden border-b border-neutral-200/60 bg-neutral-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(255,255,255,0.12), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 10%, rgba(120,120,255,0.08), transparent 50%), linear-gradient(165deg, #0a0a0a 0%, #171717 45%, #0a0a0a 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[90rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <Breadcrumbs
            className="text-neutral-400 [&_a]:text-neutral-300 [&_a:hover]:text-white [&_span]:text-neutral-500"
            items={[
              { label: "Home", href: "/" },
              { label: "Shop" },
            ]}
          />
          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                Collection
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Shop</h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-400">
                Precision-crafted footwear and apparel. Filter by fit, palette, and brand — everything is tuned for
                clarity and calm shopping.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-medium text-neutral-200 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                {filtered.length} pieces
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-neutral-300 backdrop-blur-md">
                Free returns · Authentic quality
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:flex lg:gap-10 lg:px-8 lg:py-12">
        {/* Mobile / tablet filter drawer */}
        <details className="group mb-8 rounded-2xl border border-neutral-200/80 bg-white/70 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              Filters
              {activeFilters > 0 ? (
                <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-[11px] font-bold text-white">
                  {activeFilters}
                </span>
              ) : null}
            </span>
            <span className="text-neutral-400 transition group-open:rotate-180">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </summary>
          <div className="border-t border-neutral-100 px-4 pb-5 pt-2">
            <FilterFields
              labelClass={labelClass}
              selectClass={selectClass}
              filterInputClass={filterInputClass}
              colors={colors}
              color={color}
              setColor={setColorFilter}
              brands={brands}
              brand={brand}
              setBrand={setBrandFilter}
              sizes={sizes}
              size={size}
              setSize={setSizeFilter}
              categories={categories}
              category={category}
              setCategory={setCategory}
              sort={sort}
              setSort={setSortFilter}
              search={search}
              setSearch={setSearchFilter}
            />
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 w-full rounded-xl border border-neutral-200 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-700 transition hover:bg-neutral-50"
            >
              Clear all
            </button>
          </div>
        </details>

        {/* Desktop sticky sidebar */}
        <aside className="hidden lg:block lg:w-72 lg:shrink-0">
          <div className="sticky top-24 space-y-6 rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-4">
              <h2 className="text-sm font-semibold tracking-tight text-neutral-950">Refine</h2>
              {activeFilters > 0 ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
                >
                  Reset
                </button>
              ) : null}
            </div>
            <FilterFields
              labelClass={labelClass}
              selectClass={selectClass}
              filterInputClass={filterInputClass}
              colors={colors}
              color={color}
              setColor={setColorFilter}
              brands={brands}
              brand={brand}
              setBrand={setBrandFilter}
              sizes={sizes}
              size={size}
              setSize={setSizeFilter}
              categories={categories}
              category={category}
              setCategory={setCategory}
              sort={sort}
              setSort={setSortFilter}
              search={search}
              setSearch={setSearchFilter}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500" aria-live="polite">
              <span className="font-medium text-neutral-800">{filtered.length}</span> results
              {category !== "All" ? (
                <>
                  {" "}
                  in <span className="font-medium text-neutral-800">{category}</span>
                </>
              ) : null}
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center lg:hidden">
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
                className={`${selectClass} sm:min-w-[13rem]`}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-900 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                View bag
              </Link>
            </div>
          </div>

          <div className="transition-opacity duration-300">
            {paginated.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-6 py-20 text-center">
                <p className="text-lg font-medium text-neutral-800">No matches yet</p>
                <p className="mt-2 text-sm text-neutral-500">Relax a filter or try another search keyword.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((product, idx) => (
                  <div
                    key={product._id}
                    className="animate-fade-in-up [animation-fill-mode:both]"
                    style={{ animationDelay: `${Math.min(idx, 8) * 45}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onOpenImage={(src, alt) => setPreviewImage({ src, alt })}
                      priority={safePage === 1 && idx < 4}
                    />
                  </div>
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
          className="fixed inset-0 z-[90] flex cursor-zoom-out items-center justify-center bg-neutral-950/88 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImage(null)}
          aria-label="Close preview"
        >
          <span
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-md transition hover:bg-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            ×
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage.src}
            alt={previewImage.alt}
            className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      ) : null}
    </div>
  );
}

function FilterFields({
  labelClass,
  selectClass,
  filterInputClass,
  colors,
  color,
  setColor,
  brands,
  brand,
  setBrand,
  sizes,
  size,
  setSize,
  categories,
  category,
  setCategory,
  sort,
  setSort,
  search,
  setSearch,
}: {
  labelClass: string;
  selectClass: string;
  filterInputClass: string;
  colors: string[];
  color: string;
  setColor: (v: string) => void;
  brands: string[];
  brand: string;
  setBrand: (v: string) => void;
  sizes: string[];
  size: string;
  setSize: (v: string) => void;
  categories: string[];
  category: string;
  setCategory: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="filter-search" className={labelClass}>
          Search
        </label>
        <input
          id="filter-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, mood, silhouette…"
          className={filterInputClass}
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor="filter-category" className={labelClass}>
          Category
        </label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
        >
          {categories.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-brand" className={labelClass}>
          Brand
        </label>
        <select id="filter-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass}>
          {brands.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-color" className={labelClass}>
          Color
        </label>
        <select id="filter-color" value={color} onChange={(e) => setColor(e.target.value)} className={selectClass}>
          {colors.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-size" className={labelClass}>
          Size
        </label>
        <select id="filter-size" value={size} onChange={(e) => setSize(e.target.value)} className={selectClass}>
          {sizes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden lg:block">
        <label htmlFor="filter-sort" className={labelClass}>
          Sort
        </label>
        <select id="filter-sort" value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
