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

const BASE: Product[] = [
  {
    id: "adizero-evo-sl",
    title: "Adizero Evo SL Shoes",
    category: "Men's Performance",
    description:
      "Lightweight racing-inspired trainer built for speed. Breathable mesh upper, responsive midsole cushioning for daily training runs.",
    price: 285000,
    images: images(),
    colors: ["Purple", "Blue", "Black"],
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
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
    sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43"],
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
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
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
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42"],
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
    sizes: ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40"],
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
    sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
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
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
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
    sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43"],
  },
];

// Repeat the base catalog with unique ids to have enough items to demo
// infinite scroll / lazy loading against.
export const PRODUCTS: Product[] = Array.from({ length: 6 }, (_, batch) =>
  BASE.map((p) => ({
    ...p,
    id: batch === 0 ? p.id : `${p.id}-${batch}`,
  })),
).flat();

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export const CATEGORIES = Array.from(new Set(BASE.map((p) => p.category)));
export const COLORS = Array.from(new Set(BASE.flatMap((p) => p.colors)));
export const SIZES = Array.from(new Set(BASE.flatMap((p) => p.sizes))).sort();
export const MIN_PRICE = Math.min(...BASE.map((p) => p.price));
export const MAX_PRICE = Math.max(...BASE.map((p) => p.price));
