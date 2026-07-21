import type { Product } from "./types";

const IMAGE_POOL = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFSJieVeCjB8mrF6QexA7BMU1Ytshz-CyoeXvXg5Bx-U2Y7u5oR8TClwY&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTtPvFTrKumac52jB13aXyeLIKMr_Fg706K4fUUgdnP9R2p5MXrFewGQs&s=10",
  "https://i5.walmartimages.com/seo/Bandai-Hobby-MG-Gundam-RX-78-2-Ver-3-0-1-100-Scale-Action-Figure-Model-Kit_ee1b2ded-0542-4634-835b-442beae2997d.72cd70f2d985662b8091a84a5527f5db.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf2I_JRddV8wZOU3CmEQbUVmLO4wRkoQGG-0vFt6LigrGJKPt-Cr4cPkQ7&s=10",
];

let poolIndex = 0;
function nextImage() {
  const src = IMAGE_POOL[poolIndex % IMAGE_POOL.length];
  poolIndex += 1;
  return src;
}

function images(): [string, string, string] {
  return [nextImage(), nextImage(), nextImage()];
}

export const CATEGORY_TREE: { name: string; subs: string[] }[] = [
  { name: "3D Printers", subs: ["3D Printer Accessories", "3D Printer Spare Parts"] },
  { name: "Filaments", subs: ["PLA", "PLA+", "PLA Silk", "PETG", "ABS", "ASA"] },
  { name: "Art", subs: ["Sculptures", "Sign & Logos"] },
  {
    name: "Education",
    subs: [
      "Biology",
      "Chemistry",
      "Engineering",
      "Geography",
      "Mathematics",
      "Physics & Astronomy",
      "Other Education Models",
    ],
  },
  { name: "Fashion", subs: ["Earrings", "Footwear", "Glasses", "Jewelry", "Rings", "Other Fashion Models"] },
  { name: "Hobby & DIY", subs: ["Electronics", "Sport & Outdoors", "Vehicles", "Other Hobby & DIY"] },
  { name: "Household", subs: ["Décor", "Festivities", "Garden", "Office", "Pets", "Other House Models"] },
  { name: "Miniatures", subs: ["Animals", "Architecture", "Creatures", "People", "Other Miniatures"] },
  {
    name: "Cosplay & Props",
    subs: ["Costumes", "Masks & Helmets", "Cosplay Weapons", "Other Cosplay & Props"],
  },
  {
    name: "Tools",
    subs: ["Gadgets", "Hand Tools", "Machine Tools", "Measure Tools", "Medical Tools", "Organizers", "Other Tools"],
  },
  {
    name: "Toys & Games",
    subs: ["Board Games", "Characters", "Outdoor Toys", "Puzzles", "Construction Sets", "Other Toys & Games"],
  },
  { name: "Others", subs: ["Pin Badges", "Pin Raw Materials"] },
];

const MATERIALS = ["PLA", "Resin", "ABS"];
const SIZE_PRICES: Record<string, number> = { XS: 0, S: 0, M: 3000, L: 6000, XL: 10000 };
const MATERIAL_PRICES: Record<string, number> = { PLA: 0, ABS: 2000, Resin: 8000 };

const RAW_PRODUCTS: Omit<
  Product,
  | "materials"
  | "sizePrices"
  | "sizeDiscounts"
  | "materialPrices"
  | "colorImages"
  | "materialImages"
  | "costPrice"
  | "discountType"
  | "discountValue"
  | "stock"
  | "lowStockThreshold"
>[] = [
  {
    id: "adizero-evo-sl",
    title: "Adizero Evo SL Shoes",
    category: "Men's Performance",
    description:
      "Lightweight racing-inspired trainer built for speed. Breathable mesh upper, responsive midsole cushioning for daily training runs.",
    price: 285000,
    images: images(),
    colors: ["Purple", "Blue", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "handball-spezial",
    title: "Handball Spezial Shoes",
    category: "Originals",
    description:
      "Suede terrace classic since the '70s. Gum rubber outsole, low-cut collar, timeless court silhouette.",
    price: 210000,
    images: images(),
    colors: ["Navy", "White", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "ultraboost-light",
    title: "Ultraboost Light Shoes",
    category: "Men's Performance",
    description:
      "Lightest Ultraboost ever made. Energy-returning midsole wrapped in a supportive Primeknit upper.",
    price: 320000,
    images: images(),
    colors: ["Red", "Black", "White"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "gazelle-classic",
    title: "Gazelle Classic Shoes",
    category: "Originals",
    description:
      "Retro suede sneaker with a rubber shell toe. An icon on the street since the 1960s.",
    price: 195000,
    images: images(),
    colors: ["Black", "Red", "Beige"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "runfalcon-3",
    title: "Runfalcon 3 Shoes",
    category: "Women's Running",
    description:
      "Everyday running shoe with a cushioned feel and a durable rubber outsole for traction.",
    price: 150000,
    images: images(),
    colors: ["Pink", "White", "Grey"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "superstar-og",
    title: "Superstar OG Shoes",
    category: "Originals",
    description:
      "The shell-toe icon since 1970. Leather upper, rubber shell toe, classic three stripes.",
    price: 225000,
    images: images(),
    colors: ["White", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "duramo-sl",
    title: "Duramo SL Shoes",
    category: "Men's Performance",
    description:
      "Simple, comfortable running shoe with cushioned midsole for everyday wear and training.",
    price: 135000,
    images: images(),
    colors: ["Red", "Black", "Blue"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "forum-low",
    title: "Forum Low Shoes",
    category: "Originals",
    description:
      "'80s basketball style reborn. Padded ankle strap, leather upper, chunky rubber cupsole.",
    price: 240000,
    images: images(),
    colors: ["White", "Navy", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

export const BASE_PRODUCTS: Product[] = RAW_PRODUCTS.map((p) => ({
  ...p,
  materials: MATERIALS,
  sizePrices: Object.fromEntries(p.sizes.map((s) => [s, SIZE_PRICES[s] ?? 0])),
  sizeDiscounts: {},
  materialPrices: Object.fromEntries(MATERIALS.map((m) => [m, MATERIAL_PRICES[m] ?? 0])),
  colorImages: {},
  materialImages: {},
  costPrice: Math.round(p.price * 0.6),
  discountType: "percent" as const,
  discountValue: 0,
  stock: 20,
  lowStockThreshold: 5,
}));

// NOTE: this file is now only a seed source for `prisma/seed.ts`.
// The running app reads products/categories/colors/sizes from the database
// via the /api/* routes — see lib/db.ts and lib/use-products.ts.
export const CATEGORIES = Array.from(new Set(BASE_PRODUCTS.map((p) => p.category)));
export const COLORS = Array.from(new Set(BASE_PRODUCTS.flatMap((p) => p.colors)));
export const SIZES = Array.from(new Set(BASE_PRODUCTS.flatMap((p) => p.sizes))).sort();
export const MATERIALS_LIST = MATERIALS;
