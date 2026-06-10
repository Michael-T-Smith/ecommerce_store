"use client";

import { useState }          from "react";
import AnnouncementBar       from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar                from "@/app/components/Navbar/Navbar";
import HeroSection           from "@/app/components/HeroSection/HeroSection";
import OccasionsTicker       from "@/app/components/OccasionsTicker/OccasionsTicker";
import FeaturedArrangements  from "@/app/components/FeaturedArrangements/FeaturedArrangements";
import CatalogSection        from "@/app/components/CatalogSection/CatalogSection";
import PromoBand             from "@/app/components/PromoBand/PromoBand";
import Footer                from "@/app/components/Footer/Footer";
import { HERO_THEMES }       from "@/lib/themes";

export default function HomePageClient({ featuredItems = [] }) {
  const [themeKey, setThemeKey] = useState("default");
  let theme = HERO_THEMES[themeKey];
  if(!theme) theme = HERO_THEMES["default"];

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />
      <HeroSection theme={theme} featuredItems={featuredItems} />
      <Footer />
    </div>
  );
}