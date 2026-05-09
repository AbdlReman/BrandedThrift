export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#fafafa] pb-24">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8">
          <div className="h-4 w-56 rounded-md bg-neutral-200" />
        </div>
      </div>
      <div className="mx-auto grid max-w-[90rem] gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="aspect-square rounded-3xl bg-neutral-200" />
        <div className="space-y-6">
          <div className="h-4 w-24 rounded-md bg-neutral-200" />
          <div className="h-12 w-full max-w-lg rounded-xl bg-neutral-200" />
          <div className="h-6 w-48 rounded-md bg-neutral-100" />
          <div className="h-28 w-full rounded-xl bg-neutral-100" />
          <div className="h-14 w-full rounded-2xl bg-neutral-200" />
          <div className="h-14 w-full rounded-2xl bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
