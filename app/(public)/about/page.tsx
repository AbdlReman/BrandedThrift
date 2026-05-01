import Link from "next/link";

const team = [
  { name: "Jordan Lee",    role: "Founder & CEO",         emoji: "👤" },
  { name: "Sarah Kim",     role: "Head of Curation",      emoji: "👤" },
  { name: "Marcus Obi",    role: "Brand Partnerships",    emoji: "👤" },
  { name: "Priya Sharma",  role: "Customer Experience",   emoji: "👤" },
];

const milestones = [
  { year: "2019", event: "Branded Thrift founded from a garage in NYC" },
  { year: "2020", event: "Launched online store, 500+ shoes in first month" },
  { year: "2021", event: "Partnered with 25+ premium brands" },
  { year: "2022", event: "Reached 10,000 happy customers" },
  { year: "2023", event: "Opened first physical pop-up store" },
  { year: "2024", event: "Expanded globally — shipping to 40+ countries" },
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
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Branded Thrift was born from a simple belief: premium footwear
                shouldn&apos;t cost a premium. We source authentic branded shoes
                directly from manufacturers, overstock, and carefully vetted
                pre-loved collections.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[["500+", "Styles Available"], ["50+", "Brand Partners"], ["10K+", "Customers Served"], ["40+", "Countries Shipped"]].map(([num, label]) => (
                <div key={label} className="border border-gray-800 p-6">
                  <p className="text-4xl font-black mb-2">{num}</p>
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
            <Link href="/shop" className="btn-primary">
              Shop the Collection
            </Link>
          </div>

          {/* Values */}
          <div className="space-y-6">
            {[
              { title: "Authenticity First", desc: "Triple-checked authentication on every single pair. If it's not real, it doesn't ship." },
              { title: "Sustainable Fashion", desc: "By extending the lifecycle of premium footwear, we reduce waste and carbon emissions." },
              { title: "Community Driven", desc: "Built by sneaker lovers, for sneaker lovers. Your feedback shapes everything we do." },
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

      {/* Timeline */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Our Journey</p>
            <h2 className="text-4xl font-black uppercase tracking-tight">Milestones</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-gray-300" />
            <div className="space-y-8">
              {milestones.map(({ year, event }) => (
                <div key={year} className="flex gap-8 items-start">
                  <div className="w-32 flex-shrink-0 text-right">
                    <span className="font-black text-lg">{year}</span>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className="w-3 h-3 bg-black rounded-full mt-1.5" />
                  </div>
                  <p className="text-gray-600 pt-0.5">{event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
      </section>

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
