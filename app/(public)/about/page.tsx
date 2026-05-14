import Link from "next/link";

const team = [
  { name: "Jordan Lee",    role: "Founder & CEO",         emoji: "👤" },
  { name: "Sarah Kim",     role: "Head of Curation",      emoji: "👤" },
  { name: "Marcus Obi",    role: "Brand Partnerships",    emoji: "👤" },
  { name: "Priya Sharma",  role: "Customer Experience",   emoji: "👤" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white min-h-[60vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {" / "}About
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-8">
                Our
                <br />
                <span className="text-gray-500">Story</span>
              </h1>
              <div className="space-y-4 text-gray-400 text-lg leading-relaxed max-w-lg">
                <p>Branded Thrift was built on a simple idea: good sneakers shouldn&apos;t cost a fortune.</p>
                <p>
                  We carefully source authentic preloved footwear and give quality pairs a second life - making
                  premium styles more accessible at reasonable prices.
                </p>
                <p>Every pair is selected with focus on authenticity, condition, and everyday wear.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["CURATED", "PRELOVED SNEAKERS"],
                ["ORIGINAL", "PAIRS ONLY"],
                ["REASONABLE", "PRICING"],
                ["NEW DROPS", "REGULARLY"],
              ].map(([num, label]) => (
                <div key={label} className="border border-gray-800 p-6">
                  <p className="text-2xl md:text-3xl font-black mb-2">{num}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Our Mission</p>
            <h2 className="text-4xl font-black uppercase tracking-tight mb-6">
              Style For Everyone
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We believe that access to quality footwear is a right, not a privilege.
              Our mission is to democratize premium fashion by connecting sneaker lovers
              with authentic branded shoes at prices that won&apos;t break the bank.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Every pair we sell is authenticated by our expert team. We&apos;re not
              just selling shoes — we&apos;re building a community of conscious consumers
              who value quality, style, and sustainability.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center border-2 border-black bg-black px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
            >
              Shop the Collection
            </Link>
          </div>

          {/* Values */}
          <div className="space-y-6">
            {[
              {
                title: "Authentic Pairs Only",
                desc: "Every pair is carefully checked before listing. We only sell original preloved footwear.",
              },
              {
                title: "No Repaired Shoes",
                desc: "We focus on clean, wearable pairs. Product condition is always shown as clearly as possible.",
              },
              {
                title: "Community Driven",
                desc: "Built for people who love sneakers, style, and smart buying. New pairs added regularly.",
              },
            ].map(({ title, desc }, i) => (
              <div key={title} className="flex gap-5">
                <div className="w-10 h-10 bg-black text-white rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">The People</p>
          <h2 className="text-4xl font-black uppercase tracking-tight">Meet the Team</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {team.map(({ name, role, emoji }) => (
            <div key={name} className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                {emoji}
              </div>
              <h3 className="font-black uppercase tracking-tight text-sm mb-1">{name}</h3>
              <p className="text-gray-500 text-xs">{role}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* CTA */}
      <section className="bg-black text-white py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
          Ready to Shop?
        </h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">
          Browse our latest collection of authentic branded footwear.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/shop" className="btn-primary">
            Shop Now
          </Link>
          <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-black">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
