
export const NAV_LINKS = [
  { label: "Shop",      href: "/shop"      },
  { label: "Occasions", href: "/occasions" },
  { label: "About",     href: "/about"     },
  { label: "Delivery",  href: "/delivery"  },
];

export const OCCASIONS = [
  "Birthday", "Anniversary", "Just Because",
  "Sympathy", "Wedding",     "Holiday",
];

export const FEATURED = [
  { id: 5,  name: "Tropical Paradise",  price: 68, tag: "Bestseller", accent: "#D4511A", emoji: "🌺" },
  { id: 1,  name: "Classic Red Roses",  price: 52, tag: "Popular",    accent: "#3D2B1A", emoji: "🌹" },
  { id: 11, name: "Autumn Wreath",      price: 78, tag: "Seasonal",   accent: "#C9A84C", emoji: "🍂" },
];

export const CATALOG_CATEGORIES = [
  "All", "Bouquets", "Arrangements", "Plants", "Seasonal", "Gifts",
];

export const CATALOG = [
  {
    id: 1,  name: "Classic Red Roses",
    price: 52, category: "Bouquets", emoji: "🌹", tag: "Popular",
    description: "A timeless dozen long-stemmed red roses, hand-tied with eucalyptus and wrapped in kraft paper.",
    inStock: true, sizes: ["Small", "Standard", "Large"],
  },
  {
    id: 2,  name: "Sunflower Bundle",
    price: 38, category: "Bouquets", emoji: "🌻", tag: null,
    description: "Cheerful sunflowers bundled with seasonal greenery — a ray of sunshine for any occasion.",
    inStock: true, sizes: ["Standard", "Large"],
  },
  {
    id: 3,  name: "Wildflower Mix",
    price: 44, category: "Bouquets", emoji: "💐", tag: "New",
    description: "A loose, garden-gathered mix of seasonal wildflowers. No two are ever alike.",
    inStock: true, sizes: ["Small", "Standard", "Large"],
  },
  {
    id: 4,  name: "Lavender Stems",
    price: 36, category: "Bouquets", emoji: "💜", tag: null,
    description: "Fresh lavender stems bundled and tied with twine. Fragrant, calming, beautiful.",
    inStock: true, sizes: ["Standard"],
  },
  {
    id: 5,  name: "Tropical Paradise",
    price: 68, category: "Arrangements", emoji: "🌺", tag: "Bestseller",
    description: "Birds of paradise, anthuriums, and tropical foliage arranged in a ceramic vessel.",
    inStock: true, sizes: ["Standard", "Large"],
  },
  {
    id: 6,  name: "Garden Centerpiece",
    price: 85, category: "Arrangements", emoji: "🌸", tag: null,
    description: "A lush, low centerpiece of garden roses, ranunculus, and soft greenery. Perfect for tables.",
    inStock: true, sizes: ["Standard", "Large", "XL"],
  },
  {
    id: 7,  name: "Rustic Wildflower Vase",
    price: 57, category: "Arrangements", emoji: "🌼", tag: null,
    description: "Dahlias, cosmos, and seasonal blooms in a mason jar — relaxed, warm, and inviting.",
    inStock: true, sizes: ["Small", "Standard"],
  },
  {
    id: 8,  name: "Succulent Collection",
    price: 42, category: "Plants", emoji: "🪴", tag: "Popular",
    description: "A curated set of three succulents in coordinating terra cotta pots. Low maintenance, long lasting.",
    inStock: true, sizes: ["Standard"],
  },
  {
    id: 9,  name: "Peace Lily",
    price: 35, category: "Plants", emoji: "🌿", tag: null,
    description: "A classic peace lily in a nursery pot. Air purifying, shade tolerant, and easy to care for.",
    inStock: true, sizes: ["Small", "Standard", "Large"],
  },
  {
    id: 10, name: "Orchid Duo",
    price: 65, category: "Plants", emoji: "🌷", tag: "New",
    description: "Two phalaenopsis orchids in coordinating ceramic pots. Elegant and long-blooming.",
    inStock: false, sizes: ["Standard"],
  },
  {
    id: 11, name: "Autumn Wreath",
    price: 78, category: "Seasonal", emoji: "🍂", tag: "Seasonal",
    description: "Hand-crafted dried wreath with preserved oak leaves, seed pods, and cotton stems.",
    inStock: true, sizes: ["Standard", "Large"],
  },
  {
    id: 12, name: "Holiday Poinsettia",
    price: 32, category: "Seasonal", emoji: "🎄", tag: "Seasonal",
    description: "Classic red poinsettia in a foil-wrapped pot. A holiday staple for home or gifting.",
    inStock: true, sizes: ["Small", "Standard", "Large"],
  },
  {
    id: 13, name: "Spring Tulip Bunch",
    price: 40, category: "Seasonal", emoji: "🌷", tag: null,
    description: "A hand-tied bunch of mixed tulips in seasonal colors. Fresh from our growers weekly.",
    inStock: true, sizes: ["Standard", "Large"],
  },
  {
    id: 14, name: "Gift Basket — Blooms",
    price: 90, category: "Gifts", emoji: "🎁", tag: "Popular",
    description: "A wicker basket filled with a small arrangement, chocolates, and a handwritten card.",
    inStock: true, sizes: ["Standard", "Large"],
  },
  {
    id: 15, name: "Dried Flower Bundle",
    price: 48, category: "Gifts", emoji: "🪷", tag: null,
    description: "Preserved pampas, dried roses, and bunny tail grass — a lasting, low-maintenance gift.",
    inStock: true, sizes: ["Small", "Standard"],
  },
  {
    id: 16, name: "Bud Vase Set",
    price: 55, category: "Gifts", emoji: "🏺", tag: "New",
    description: "A set of three bud vases with single-stem flowers — minimal, modern, and gift-ready.",
    inStock: true, sizes: ["Standard"],
  },
];