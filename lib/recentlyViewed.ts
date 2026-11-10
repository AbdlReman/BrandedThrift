export const RECENTLY_VIEWED_KEY = "puma_recently_viewed";

export type RecentViewEntry = {
  slug: string;
  name: string;
  image: string;
  brand: string;
  price: number;
  discount: number;
  inStock: boolean;
  stockQuantity: number;
};

const MAX = 10;

export function readRecentlyViewed(): RecentViewEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (x): x is Partial<RecentViewEntry> & Pick<RecentViewEntry, "slug" | "name" | "image"> =>
          Boolean(
            x &&
              typeof (x as RecentViewEntry).slug === "string" &&
              typeof (x as RecentViewEntry).name === "string" &&
              typeof (x as RecentViewEntry).image === "string"
          )
      )
      .map((x) => {
        const stockQuantity = Number(x.stockQuantity);
        const hasStockQty = Number.isFinite(stockQuantity);
        const inStock =
          typeof x.inStock === "boolean"
            ? x.inStock
            : hasStockQty
              ? stockQuantity > 0
              : true;
        return {
          slug: x.slug,
          name: x.name,
          image: x.image,
          brand: typeof x.brand === "string" ? x.brand : "",
          price: Number(x.price) || 0,
          discount: Number(x.discount) || 0,
          inStock,
          stockQuantity: hasStockQty ? stockQuantity : inStock ? 1 : 0,
        };
      })
      .slice(0, MAX);
  } catch {
    return [];
  }
}

export function writeRecentlyViewed(entries: RecentViewEntry[]) {
  if (typeof window === "undefined") return;
  const next = entries
    .filter(
      (x): x is RecentViewEntry =>
        x &&
        typeof x.slug === "string" &&
        typeof x.name === "string" &&
        typeof x.image === "string"
    )
    .slice(0, MAX);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
}

export function pushRecentlyViewed(entry: RecentViewEntry, excludeSlug?: string) {
  if (typeof window === "undefined") return;
  const prev = readRecentlyViewed().filter((e) => e.slug !== entry.slug && e.slug !== excludeSlug);
  const next = [entry, ...prev].slice(0, MAX);
  writeRecentlyViewed(next);
}
