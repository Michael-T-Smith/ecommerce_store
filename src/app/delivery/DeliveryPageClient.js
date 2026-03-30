
"use client";

import { useState }      from "react";
import AnnouncementBar   from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar            from "@/app/components/Navbar/Navbar";
import ShopBanner        from "@/app/components/ShopBanner/ShopBanner";
import DeliveryPolicy    from "@/app/components/DeliveryPolicy/DeliveryPolicy";
import DeliveryZones     from "@/app/components/DeliveryZones/DeliveryZones";
import DeliveryFAQ       from "@/app/components/DeliveryFAQ/DeliveryFAQ";
import PromoBand         from "@/app/components/PromoBand/PromoBand";
import Footer            from "@/app/components/Footer/Footer";

export default function DeliveryPageClient() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setCartCount((c) => c + 1)}
      />

      <ShopBanner
        title="Delivery"
        subtitle="Same-day delivery across Piedmont, Anniston, and Centre — hand-delivered by our own team."
      />

      {/* TL;DR policy strip — answers the fast scan before anything else */}
      <DeliveryPolicy />

      {/* Zone cards — answers: can you deliver to me? */}
      <DeliveryZones />

      {/* Delivery range notice */}
      <div className="bg-brand-cream border-t border-brand-black/10 px-5 sm:px-10 lg:px-16 py-10 text-center">
        <p className="font-sans text-brand-smoke text-[13px] leading-relaxed max-w-[600px] mx-auto">
          <span className="font-extrabold text-brand-black">We deliver within a 50-mile radius of Piedmont.</span>{" "}
          Orders outside our standard zones are welcome at a variable rate based on distance.
          For destinations beyond 50 miles, please call us at{" "}
          <a href="tel:+12564474800" className="text-brand-orange font-extrabold no-underline hover:underline">
            (256) 447-4800
          </a>{" "}
          before placing your order.
        </p>
      </div>

      {/* FAQ — answers the friction points before cart abandonment */}
      <DeliveryFAQ />

      <PromoBand />
      <Footer />
    </div>
  );
}