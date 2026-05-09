export function ShopProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-100" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-[75%] rounded-md bg-neutral-200" />
            <div className="h-3 w-1/3 rounded-md bg-neutral-100" />
            <div className="h-5 w-1/4 rounded-md bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
