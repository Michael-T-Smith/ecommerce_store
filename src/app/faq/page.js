"use client";

import { useState } from "react";
import Link          from "next/link";
import AnnouncementBar from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar          from "@/app/components/Navbar/Navbar";
import Footer          from "@/app/components/Footer/Footer";
import BirdLogo      from "@/app/components/icons/BirdLogo";
import { C }           from "@/lib/brand";

const SECTIONS = [
  {
    id   : "orders",
    label: "Orders",
    icon : "🛍️",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our shop, select your item, choose a size if applicable, and add it to your bag. When you're ready, head to checkout and complete your purchase online. We accept all major credit cards and digital wallets.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "We begin processing orders quickly. If you need to make a change, email hello@company.com as soon as possible with your order number. We'll do our best, but we cannot guarantee changes once an order enters fulfillment.",
      },
      {
        q: "Will I receive a confirmation after ordering?",
        a: "Yes — a confirmation email is sent to the address provided at checkout. Check your spam folder if you don't see it within a few minutes. The email includes your order number and a summary of what you purchased.",
      },
      {
        q: "Can I order by phone or in person?",
        a: "BityBird Co is an online-only shop. We don't have a physical storefront and do not accept phone or in-person orders. All purchases are made through our website.",
      },
      {
        q: "Do you offer gift wrapping or personal notes?",
        a: "Every BityBird Co order includes a personal note card at no extra charge. Simply add your message during checkout. Gift wrapping upgrades may be available on select items — check the product page for details.",
      },
    ],
  },
  {
    id   : "shipping",
    label: "Shipping",
    icon : "📦",
    items: [
      {
        q: "Where do you ship?",
        a: "We ship to all 50 US states. We currently do not offer international shipping, but check back as we plan to expand in the future.",
      },
      {
        q: "How long will my order take to arrive?",
        a: "Standard shipping takes 3–5 business days after your order ships. Express shipping (1–2 business days) and overnight options are available at checkout for an additional fee.",
      },
      {
        q: "When do orders ship?",
        a: "Orders placed Monday through Friday are processed and shipped the same business day, provided they are received before 1:00 PM CST. Orders placed on Saturday or Sunday ship the following Monday. We do not ship on federal holidays.",
      },
      {
        q: "Do you offer local pickup or delivery?",
        a: "No — BityBird Co is a shipping-only business. We do not offer local pickup, curbside, or local delivery. All orders are shipped directly to your door via our carrier partners.",
      },
      {
        q: "How much does shipping cost?",
        a: "Standard shipping is a flat $8.99. Orders over $75 qualify for free standard shipping, automatically applied at checkout. Express and overnight rates are calculated at checkout based on your location.",
      },
      {
        q: "How do I track my shipment?",
        a: "Once your order ships, you'll receive a tracking number by email. You can also log into your account at any time and view real-time tracking under My Orders.",
      },
      {
        q: "What if my package is lost or delayed?",
        a: "If your tracking hasn't updated in 5+ business days or shows delivered but you haven't received it, email hello@company.com with your order number. We'll open a carrier investigation and make it right.",
      },
    ],
  },
  {
    id   : "returns",
    label: "Returns",
    icon : "↩️",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 14 days of delivery. Items must be unused, undamaged, and in their original condition. To start a return, email hello@company.com with your order number.",
      },
      {
        q: "Who pays for return shipping?",
        a: "If an item arrives damaged or we made an error, we cover the cost of return shipping. For change-of-mind returns, the buyer is responsible for return postage.",
      },
      {
        q: "Are handcrafted or one-of-a-kind items returnable?",
        a: "Yes, if an item arrives damaged or isn't accurately described. Because every piece is unique, we handle these situations individually — just reach out and we'll take care of you.",
      },
      {
        q: "How long do refunds take?",
        a: "Once we receive and inspect your return, refunds are issued within 3–5 business days to your original payment method. You'll receive an email confirmation when the refund is processed.",
      },
      {
        q: "My order arrived damaged — what do I do?",
        a: "Please email us within 48 hours of delivery with a photo of the damaged item and packaging. We'll arrange a replacement or issue a full refund — whichever you prefer.",
      },
    ],
  },
  {
    id   : "products",
    label: "Products",
    icon : "✨",
    items: [
      {
        q: "What types of products do you sell?",
        a: "BityBird Co carries two categories: handcrafted goods made one at a time by skilled makers, and carefully curated refurbished finds — vintage and pre-owned items we've vetted and restored. Every piece is one-of-a-kind.",
      },
      {
        q: "Are your products truly one of a kind?",
        a: "Yes. Handcrafted items are made individually and never duplicated. Refurbished finds are sourced as single pieces. When something sells, it's gone — we don't restock the same item.",
      },
      {
        q: "How are your prices determined?",
        a: "Prices reflect the craft, time, materials, and care that goes into each piece. We believe handmade and thoughtfully restored goods deserve fair pricing — and we stand behind every item we sell.",
      },
      {
        q: "Do products come with any care instructions?",
        a: "Care details are included on the product page and, where applicable, on a card included in your shipment. If you have specific questions about an item, email us before purchasing.",
      },
      {
        q: "Can I request a custom or personalized item?",
        a: "We occasionally accept custom commissions on select handcrafted items. Email hello@company.com with your idea and we'll let you know if it's something we can take on.",
      },
    ],
  },
  {
    id   : "account",
    label: "Account & Payments",
    icon : "🔐",
    items: [
      {
        q: "Do I need an account to order?",
        a: "No — you can check out as a guest. However, creating a free account lets you track orders, save addresses, and view your order history from any device.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover) as well as Apple Pay and Google Pay. All transactions are encrypted and processed securely.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. We never store your card details — payments are processed by Stripe, a PCI-compliant payment processor. Your financial information is fully encrypted end-to-end.",
      },
      {
        q: "How do I reset my password?",
        a: "On the Sign In page, click \"Forgot password?\" and enter your email address. You'll receive a reset link within a few minutes. Check your spam folder if it doesn't appear.",
      },
      {
        q: "How do I update my shipping address?",
        a: "Log into your account, navigate to My Account → Addresses, and add or edit your saved addresses. You can also enter a new address at checkout without saving it.",
      },
    ],
  },
];

function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-brand-black/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full text-left py-5 flex items-start justify-between gap-6 cursor-pointer bg-transparent border-0 group"
      >
        <span className="font-sans font-extrabold text-[13px] sm:text-[14px] text-brand-black leading-snug group-hover:text-brand-orange transition-colors duration-150">
          {q}
        </span>
        <span
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-black/20 group-hover:border-brand-orange transition-all duration-150 mt-0.5"
          style={{ background: isOpen ? C.blush : "transparent", borderColor: isOpen ? C.blush : undefined }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <line x1="4" y1={isOpen ? "6" : "2"} x2="4" y2={isOpen ? "2" : "6"}
              stroke={isOpen ? C.cream : "#0E0E0E"} strokeWidth="1.8" strokeLinecap="round"
              style={{ transition: "all 0.15s ease" }}
            />
            {!isOpen && <line x1="2" y1="4" x2="6" y2="4" stroke="#0E0E0E" strokeWidth="1.8" strokeLinecap="round" />}
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="pb-5 pr-10">
          <p className="font-sans text-[13px] sm:text-[14px] text-brand-smoke leading-[1.85]">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openKey,      setOpenKey     ] = useState(null);
  const [activeSection, setActiveSection] = useState("orders");

  function toggle(key) {
    setOpenKey((k) => (k === key ? null : key));
  }

  const currentSection = SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden" style={{ background: C.darkGrey }}>
        <div
          className="h-[5px] w-full"
          style={{
            background: `repeating-linear-gradient(90deg,
              ${C.blush} 0, ${C.blush} 28px,
              ${C.gold}   28px, ${C.gold}   34px,
              ${C.black}  34px, ${C.black}  38px)`,
          }}
        />
        <div className="px-5 sm:px-10 lg:px-16 py-14 sm:py-20 flex items-end justify-between gap-8">
          <div>
            <div className="font-sans font-extrabold text-[9px] tracking-[4px] uppercase text-brand-orange mb-3">
              ✦ BityBird Co
            </div>
            <h1 className="font-serif font-black text-brand-cream text-[40px] sm:text-[56px] lg:text-[68px] tracking-[-2.5px] leading-[1.0] mb-4">
              FAQ
            </h1>
            <p className="font-sans text-brand-cream/55 text-[13px] sm:text-[15px] max-w-[460px] leading-relaxed">
              Everything you need to know about ordering, shipping, returns, and more.
              Can&apos;t find your answer?{" "}
              <Link href="/contact" className="text-brand-orange no-underline hover:opacity-75 transition-opacity">
                Contact us
              </Link>
              .
            </p>
          </div>
          <div className="hidden lg:block flex-shrink-0 opacity-10">
            <BirdLogo size={140} color={C.cream} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 sm:px-10 lg:px-16 py-14 sm:py-20">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">

            {/* ── Sidebar nav ── */}
            <nav className="lg:sticky lg:top-[90px] lg:self-start flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSection(s.id); setOpenKey(null); }}
                  className={`flex items-center gap-2.5 text-left font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase px-3 py-2.5 lg:py-3 cursor-pointer border-0 bg-transparent transition-all duration-150 whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink border-b-2 lg:border-b-0 lg:border-l-2 ${
                    activeSection === s.id
                      ? "text-brand-black border-brand-orange"
                      : "text-brand-smoke border-transparent hover:text-brand-black hover:border-brand-black/20"
                  }`}
                >
                  <span className="text-[14px]">{s.icon}</span>
                  {s.label}
                </button>
              ))}

              {/* Contact callout */}
              <div className="hidden lg:block mt-8 border-[2px] border-brand-black/10 p-4">
                <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-smoke mb-2">
                  Still need help?
                </div>
                <p className="font-sans text-[12px] text-brand-smoke leading-relaxed mb-3">
                  Our team replies within one business day.
                </p>
                <Link
                  href="/contact"
                  className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-orange no-underline hover:opacity-70 transition-opacity"
                >
                  Get in touch →
                </Link>
              </div>
            </nav>

            {/* ── FAQ content ── */}
            <div>
              {/* Section heading */}
              <div className="flex items-center gap-4 mb-8 pb-5 border-b-[3px] border-brand-black">
                <span className="text-[28px] leading-none">{currentSection.icon}</span>
                <div>
                  <h2 className="font-serif font-black text-brand-black text-[26px] sm:text-[32px] tracking-[-1px] leading-none">
                    {currentSection.label}
                  </h2>
                  <div className="font-sans text-[11px] text-brand-smoke tracking-[1px] mt-1">
                    {currentSection.items.length} question{currentSection.items.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Accordion */}
              <div>
                {currentSection.items.map((item, idx) => {
                  const key = `${activeSection}-${idx}`;
                  return (
                    <AccordionItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>

              {/* Bottom callout */}
              <div
                className="mt-12 p-6 sm:p-8 border-[3px] border-brand-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                style={{ background: C.darkGrey }}
              >
                <div>
                  <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-orange mb-2">
                    Still have questions?
                  </div>
                  <p className="font-sans text-brand-cream/70 text-[13px] leading-relaxed max-w-[360px]">
                    We&apos;re a small team and we actually read our emails.
                    Reach out and you&apos;ll hear from a real person.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="flex-shrink-0 font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-cream border-[2px] border-brand-cream/30 px-6 py-3 no-underline hover:border-brand-cream hover:bg-brand-cream/10 transition-all duration-150 whitespace-nowrap"
                >
                  Contact Us →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
