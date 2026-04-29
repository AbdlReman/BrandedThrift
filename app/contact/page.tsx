"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {" / "}Contact
          </p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">
            Get in
            <br />
            <span className="text-gray-500">Touch</span>
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Info */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Contact Info</p>
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                    ),
                    label: "Our Location",
                    value: "123 Sneaker St, New York, NY 10001",
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16" />
                      </svg>
                    ),
                    label: "Phone",
                    value: "+1 (800) 555-0199",
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                    label: "Email",
                    value: "hello@brandedthrift.com",
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                    label: "Business Hours",
                    value: "Mon–Fri: 9AM–6PM EST\nSat: 10AM–4PM EST",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex-shrink-0 flex items-center justify-center">
                      {icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
                      <p className="text-sm whitespace-pre-line">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Quick Answers</p>
              <div className="space-y-4">
                {[
                  { q: "How long does shipping take?", a: "Standard: 3-5 business days. Express: 1-2 days." },
                  { q: "Are all shoes authentic?", a: "Yes — every shoe is verified by our authentication team." },
                  { q: "What is your return policy?", a: "Free returns within 30 days, no questions asked." },
                ].map(({ q, a }) => (
                  <div key={q} className="border-l-2 border-black pl-4">
                    <p className="font-bold text-sm mb-1">{q}</p>
                    <p className="text-gray-500 text-xs">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 border border-gray-200">
                <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl mb-6">
                  ✓
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-3">Message Sent!</h2>
                <p className="text-gray-500 max-w-sm mb-8">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="btn-primary"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Send Us a Message</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Subject *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                  >
                    <option value="">Select a subject…</option>
                    <option>Order & Shipping</option>
                    <option>Returns & Refunds</option>
                    <option>Product Authenticity</option>
                    <option>Partnership Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help…"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-gray-100 h-64 flex items-center justify-center border-t border-gray-200">
        <div className="text-center">
          <p className="text-4xl mb-2">📍</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">123 Sneaker St, New York, NY 10001</p>
        </div>
      </div>
    </div>
  );
}
