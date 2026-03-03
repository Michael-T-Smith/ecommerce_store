
import AnnouncementBar  from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar           from "@/app/components/Navbar/Navbar";
import ShopBanner       from "@/app/components/ShopBanner/ShopBanner";
import AboutStory       from "@/app/components/AboutStory/AboutStory";
import AboutValues      from "@/app/components/AboutValues/AboutValues";
import AboutLocations   from "@/app/components/AboutLocations/AboutLocations";
import PromoBand        from "@/app/components/PromoBand/PromoBand";
import Footer           from "@/app/components/Footer/Footer";

// Navbar needs cartCount — About is static so we wrap in a thin
// client shell just for the nav. Pattern is consistent across pages.
import AboutPageClient from "@/app/about/AboutPageClient";

export default function AboutPage() {
  return <AboutPageClient />;
}
