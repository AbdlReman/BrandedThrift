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
  viewedAt: number;
};

const MAX = 10;
const TTL_MS = 5 * 24 * 60 * 60 * 1000;

function isWithinWindow(viewedAt: number) {
  return Number.isFinite(viewedAt) && Date.now() - viewedAt <= TTL_MS;
}

function normalizeEntry(
  x: Partial<RecentViewEntry> & Pick<RecentViewEntry, "slug" | "name" | "image">
): RecentViewEntry | null {
  const viewedAt = Number(x.viewedAt);
  // Legacy entries without a timestamp get a fresh window once, then expire after 5 days.
  const resolvedViewedAt = Number.isFinite(viewedAt) && viewedAt > 0 ? viewedAt : Date.now();
  if (!isWithinWindow(resolvedViewedAt)) return null;

  const stockQuantity = Number(x.stockQuantity);
  const hasStockQty = Number.isFinite(stockQuantity);
  const inStock =
    typeof x.inStock === "boolean" ? x.inStock : hasStockQty ? stockQuantity > 0 : true;

  return {
    slug: x.slug,
    name: x.name,
    image: x.image,
    brand: typeof x.brand === "string" ? x.brand : "",
    price: Number(x.price) || 0,
    discount: Number(x.discount) || 0,
    inStock,
    stockQuantity: hasStockQty ? stockQuantity : inStock ? 1 : 0,
    viewedAt: resolvedViewedAt,
  };
}

export function readRecentlyViewed(): RecentViewEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    const next = raw
      .filter(
        (x): x is Partial<RecentViewEntry> & Pick<RecentViewEntry, "slug" | "name" | "image"> =>
          Boolean(
            x &&
              typeof (x as RecentViewEntry).slug === "string" &&
              typeof (x as RecentViewEntry).name === "string" &&
              typeof (x as RecentViewEntry).image === "string"
          )
      )
      .map((x) => normalizeEntry(x))
      .filter((x): x is RecentViewEntry => Boolean(x))
      .slice(0, MAX);

    // Persist pruned list so expired items are cleaned from storage.
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export function writeRecentlyViewed(entries: RecentViewEntry[]) {
  if (typeof window === "undefined") return;
  const next = entries
    .map((x) =>
      normalizeEntry({
        ...x,
        viewedAt: Number(x.viewedAt) || Date.now(),
      })
    )
    .filter((x): x is RecentViewEntry => Boolean(x))
    .slice(0, MAX);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
}

export function pushRecentlyViewed(entry: Omit<RecentViewEntry, "viewedAt"> & { viewedAt?: number }, excludeSlug?: string) {
  if (typeof window === "undefined") return;
  const prev = readRecentlyViewed().filter((e) => e.slug !== entry.slug && e.slug !== excludeSlug);
  const next = [
    {
      ...entry,
      viewedAt: Date.now(),
    },
    ...prev,
  ].slice(0, MAX);
  writeRecentlyViewed(next);
}
