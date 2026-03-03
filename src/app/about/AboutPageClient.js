
"use client";

import { useState } from "react";
import AnnouncementBar  from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar           from "@/app/components/Navbar/Navbar";
import ShopBanner       from "@/app/components/ShopBanner/ShopBanner";
import AboutStory       from "@/app/components/AboutStory/AboutStory";
import AboutValues      from "@/app/components/AboutValues/AboutValues";
import AboutLocations   from "@/app/components/AboutLocations/AboutLocations";
import PromoBand        from "@/app/components/PromoBand/PromoBand";
import Footer           from "@/app/components/Footer/Footer";

export default function AboutPageClient() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setCartCount((c) => c + 1)}
      />

      <ShopBanner
        title="About"
        subtitle="Two people, one shop, and a few decades of knowing exactly what flowers mean."
      />

      <AboutStory />
      <AboutValues />
      <AboutLocations />
      <PromoBand />
      <Footer />
    </div>
  );
}
