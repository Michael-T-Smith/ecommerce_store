
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

      {/* FAQ — answers the friction points before cart abandonment */}
      <DeliveryFAQ />

      <PromoBand />
      <Footer />
    </div>
  );
}