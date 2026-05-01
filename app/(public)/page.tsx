import Link from "next/link";
import Image from "next/image";

const featuredProducts = [
  {
    id: 1,
    name: "Velocity Runner Pro",
    price: 129,
    originalPrice: 180,
    brand: "PUMA",
    color: "Black / White",
    bg: "bg-gray-100",
    image: "/images/1.webp",
  },
  {
    id: 2,
    name: "Street Glide Elite",
    price: 99,
    originalPrice: 145,
    brand: "NIKE",
    color: "Red / Black",
    bg: "bg-red-50",
    image: "/images/2.webp",
  },
  {
    id: 3,
    name: "Classic Court Low",
    price: 85,
    originalPrice: 120,
    brand: "ADIDAS",
    color: "White / Navy",
    bg: "bg-blue-50",
    image: "/images/3.webp",
  },
  {
    id: 4,
    name: "Trail Blazer X9",
    price: 149,
    originalPrice: 210,
    brand: "NEW BALANCE",
    color: "Grey / Orange",
    bg: "bg-orange-50",
    image: "/images/01.webp",
  },
];

const categories = [
  { name: "Running", desc: "Performance-built for every mile", bg: "bg-black", text: "text-white" },
  { name: "Lifestyle", desc: "Street-ready everyday style", bg: "bg-gray-100", text: "text-black" },
  { name: "Training", desc: "Built for the gym & beyond", bg: "bg-gray-900", text: "text-white" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" style={{backgroundImage: 'url(/images/hero.webp)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7}} />

        {/* Decorative circle */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gray-800 opacity-30" />
        <div className="absolute right-20 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-gray-700 opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
              New Collection — Spring 2025
            </p>
            <h1 className="hero-text text-white mb-6 animate-fade-in-up">
              Move
              <br />
              <span className="text-gray-400">Fast.</span>
              <br />
              Look
              <br />
              Good.
            </h1>
            <p className="text-gray-400 text-lg max-w-md mb-10 leading-relaxed">
              Authentic branded footwear curated from the world&apos;s best labels —
              at prices that make sense.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">
                Shop Now
              </Link>
              <Link href="/about" className="btn-outline border-white text-white hover:bg-white hover:text-black">
                Our Story
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16 pt-8 border-t border-gray-800">
              {[["500+", "Styles"], ["50+", "Brands"], ["10K+", "Happy Customers"]].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black">{num}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

 
      </section>

      {/* Category Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href="/shop"
              className={`${cat.bg} ${cat.text} group relative overflow-hidden h-56 flex flex-col justify-end p-8 hover:opacity-90 transition-opacity`}
            >
              <span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                {cat.desc}
              </span>
              <h3 className="text-3xl font-black uppercase tracking-tight">
                {cat.name}
              </h3>
              <span className="mt-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Curated For You</p>
            <h2 className="text-4xl font-black uppercase tracking-tight">Featured Drops</h2>
          </div>
          <Link href="/shop" className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-2">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link key={product.id} href="/shop" className="product-card group cursor-pointer">
              {/* Image placeholder */}
              <div className={`${product.bg} h-64 flex items-center justify-center overflow-hidden mb-4 relative`}>
                <Image src={product.image} alt={product.name} fill className="object-cover product-img" />
                <span className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-widest">
                  {product.brand}
                </span>
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1">
                  SALE
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-2">{product.color}</p>
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg">${product.price}</span>
                  <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                  <span className="text-red-600 text-xs font-bold">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Full-width Banner */}
      <section className="bg-black text-white py-24 text-center" style={{backgroundImage: 'url(/images/bg.webp)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Limited Time</p>
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">
          Up to 50% Off
        </h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">
          Don&apos;t miss out on our biggest sale of the season. Premium brands, serious savings.
        </p>
        <Link href="/shop" className="btn-primary">
          Shop the Sale
        </Link>
      </section>

      {/* Why Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Why Branded Thrift</p>
          <h2 className="text-4xl font-black uppercase tracking-tight">The Difference</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: "✓", title: "100% Authentic", desc: "Every shoe is verified authentic. No replicas, no exceptions." },
            { icon: "♻", title: "Sustainable", desc: "Pre-loved and new stock — great for your wallet and the planet." },
            { icon: "⚡", title: "Fast Delivery", desc: "Orders dispatched within 24 hours. Free shipping over $75." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black">
                {icon}
              </div>
              <h3 className="font-black uppercase tracking-tight text-xl mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
