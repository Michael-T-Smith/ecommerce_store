
// ================================================================
//  FILE: src/lib/inventoryData.js  (NEW)
//  Management-side inventory data. Extends the customer-facing
//  CATALOG with fields the storefront never needs to know about:
//  costPrice, supplier, lowStockThreshold, stockCount, sku.
//
//  When DB is wired: this entire file is replaced by an API fetch.
//  The shape passed to InventoryTable does not change.
// ================================================================

export const INVENTORY_MOCK = [
  {
    id: 1,  sku: "BQ-001", name: "Classic Red Roses",
    price: 52,  costPrice: 18, category: "Bouquets",     emoji: "🌹",
    tag: "Popular",   inStock: true,  stockCount: 12,
    lowStockThreshold: 3,
    sizes: ["Small", "Standard", "Large"],
    supplier: "Piedmont Valley Growers",
    description: "A timeless dozen long-stemmed red roses, hand-tied with eucalyptus and wrapped in kraft paper.",
  },
  {
    id: 2,  sku: "BQ-002", name: "Sunflower Bundle",
    price: 38,  costPrice: 12, category: "Bouquets",     emoji: "🌻",
    tag: null,         inStock: true,  stockCount: 8,
    lowStockThreshold: 2,
    sizes: ["Standard", "Large"],
    supplier: "Piedmont Valley Growers",
    description: "Cheerful sunflowers bundled with seasonal greenery.",
  },
  {
    id: 3,  sku: "BQ-003", name: "Wildflower Mix",
    price: 44,  costPrice: 14, category: "Bouquets",     emoji: "💐",
    tag: "New",        inStock: true,  stockCount: 6,
    lowStockThreshold: 2,
    sizes: ["Small", "Standard", "Large"],
    supplier: "Blue Ridge Blooms",
    description: "A loose, garden-gathered mix of seasonal wildflowers.",
  },
  {
    id: 4,  sku: "BQ-004", name: "Lavender Stems",
    price: 36,  costPrice: 10, category: "Bouquets",     emoji: "💜",
    tag: null,         inStock: true,  stockCount: 15,
    lowStockThreshold: 3,
    sizes: ["Standard"],
    supplier: "Blue Ridge Blooms",
    description: "Fresh lavender stems bundled and tied with twine.",
  },
  {
    id: 5,  sku: "AR-001", name: "Tropical Paradise",
    price: 68,  costPrice: 26, category: "Arrangements", emoji: "🌺",
    tag: "Bestseller",  inStock: true,  stockCount: 5,
    lowStockThreshold: 2,
    sizes: ["Standard", "Large"],
    supplier: "Gulf Coast Tropicals",
    description: "Birds of paradise, anthuriums, and tropical foliage.",
  },
  {
    id: 6,  sku: "AR-002", name: "Garden Centerpiece",
    price: 85,  costPrice: 32, category: "Arrangements", emoji: "🌸",
    tag: null,         inStock: true,  stockCount: 3,
    lowStockThreshold: 2,
    sizes: ["Standard", "Large", "XL"],
    supplier: "Piedmont Valley Growers",
    description: "A lush, low centerpiece of garden roses and ranunculus.",
  },
  {
    id: 7,  sku: "AR-003", name: "Rustic Wildflower Vase",
    price: 57,  costPrice: 20, category: "Arrangements", emoji: "🌼",
    tag: null,         inStock: true,  stockCount: 7,
    lowStockThreshold: 2,
    sizes: ["Small", "Standard"],
    supplier: "Blue Ridge Blooms",
    description: "Dahlias, cosmos, and seasonal blooms in a mason jar.",
  },
  {
    id: 8,  sku: "PL-001", name: "Succulent Collection",
    price: 42,  costPrice: 15, category: "Plants",       emoji: "🪴",
    tag: "Popular",    inStock: true,  stockCount: 10,
    lowStockThreshold: 3,
    sizes: ["Standard"],
    supplier: "Desert Roots Nursery",
    description: "A curated set of three succulents in terra cotta pots.",
  },
  {
    id: 9,  sku: "PL-002", name: "Peace Lily",
    price: 35,  costPrice: 11, category: "Plants",       emoji: "🌿",
    tag: null,         inStock: true,  stockCount: 9,
    lowStockThreshold: 3,
    sizes: ["Small", "Standard", "Large"],
    supplier: "Desert Roots Nursery",
    description: "A classic peace lily in a nursery pot.",
  },
  {
    id: 10, sku: "PL-003", name: "Orchid Duo",
    price: 65,  costPrice: 28, category: "Plants",       emoji: "🌷",
    tag: "New",        inStock: false, stockCount: 0,
    lowStockThreshold: 2,
    sizes: ["Standard"],
    supplier: "Gulf Coast Tropicals",
    description: "Two phalaenopsis orchids in coordinating ceramic pots.",
  },
  {
    id: 11, sku: "SE-001", name: "Autumn Wreath",
    price: 78,  costPrice: 30, category: "Seasonal",     emoji: "🍂",
    tag: "Seasonal",   inStock: true,  stockCount: 4,
    lowStockThreshold: 2,
    sizes: ["Standard", "Large"],
    supplier: "Appalachian Dried Goods",
    description: "Hand-crafted dried wreath with preserved oak leaves.",
  },
  {
    id: 12, sku: "SE-002", name: "Holiday Poinsettia",
    price: 32,  costPrice: 10, category: "Seasonal",     emoji: "🎄",
    tag: "Seasonal",   inStock: true,  stockCount: 22,
    lowStockThreshold: 5,
    sizes: ["Small", "Standard", "Large"],
    supplier: "Piedmont Valley Growers",
    description: "Classic red poinsettia in a foil-wrapped pot.",
  },
  {
    id: 13, sku: "SE-003", name: "Spring Tulip Bunch",
    price: 40,  costPrice: 13, category: "Seasonal",     emoji: "🌷",
    tag: null,         inStock: true,  stockCount: 11,
    lowStockThreshold: 3,
    sizes: ["Standard", "Large"],
    supplier: "Blue Ridge Blooms",
    description: "A hand-tied bunch of mixed tulips in seasonal colors.",
  },
  {
    id: 14, sku: "GF-001", name: "Gift Basket — Blooms",
    price: 90,  costPrice: 38, category: "Gifts",        emoji: "🎁",
    tag: "Popular",    inStock: true,  stockCount: 5,
    lowStockThreshold: 2,
    sizes: ["Standard", "Large"],
    supplier: "In-house",
    description: "A wicker basket with arrangement, chocolates, and note.",
  },
  {
    id: 15, sku: "GF-002", name: "Dried Flower Bundle",
    price: 48,  costPrice: 16, category: "Gifts",        emoji: "🪷",
    tag: null,         inStock: true,  stockCount: 8,
    lowStockThreshold: 2,
    sizes: ["Small", "Standard"],
    supplier: "Appalachian Dried Goods",
    description: "Preserved pampas, dried roses, and bunny tail grass.",
  },
  {
    id: 16, sku: "GF-003", name: "Bud Vase Set",
    price: 55,  costPrice: 20, category: "Gifts",        emoji: "🏺",
    tag: "New",        inStock: true,  stockCount: 2,
    lowStockThreshold: 3,
    sizes: ["Standard"],
    supplier: "In-house",
    description: "A set of three bud vases with single-stem flowers.",
  },
];

export const INVENTORY_CATEGORIES = [
  "Bouquets", "Arrangements", "Plants", "Seasonal", "Gifts",
];

export const INVENTORY_TAGS = [
  "None", "New", "Popular", "Bestseller", "Seasonal",
];

export const INVENTORY_SUPPLIERS = [
  "Piedmont Valley Growers",
  "Blue Ridge Blooms",
  "Gulf Coast Tropicals",
  "Desert Roots Nursery",
  "Appalachian Dried Goods",
  "In-house",
];

