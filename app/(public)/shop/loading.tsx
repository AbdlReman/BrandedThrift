import { ShopProductSkeletonGrid } from "@/components/shop/ShopProductSkeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="border-b border-neutral-200/60 bg-neutral-950">
        <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8">
          <div className="h-4 w-40 animate-pulse rounded-md bg-white/10" />
          <div className="mt-8 h-12 max-w-md animate-pulse rounded-lg bg-white/10" />
          <div className="mt-4 h-4 max-w-lg animate-pulse rounded-md bg-white/5" />
        </div>
      </div>
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
        <ShopProductSkeletonGrid count={12} />
      </div>
    </div>
  );
}
