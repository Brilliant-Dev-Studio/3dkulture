export type ColorSwatch = {
  name: string;
  hex: string;
};

export type HeroSlide = {
  id: string;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  order: number;
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

export type Region = {
  name: string;
  nameMy: string;
};

export type City = {
  name: string;
  nameMy: string;
  region: string | null;
};

export type Township = {
  name: string;
  nameMy: string;
  deliveryFee: number;
  city: string | null;
};

export type Product = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number; // MMK, base selling price
  costPrice: number; // MMK, admin's cost — internal reference only
  discountType: "percent" | "fixed"; // percent = % off, fixed = flat MMK off
  discountValue: number; // 0-100 for percent, MMK amount for fixed
  isPreorder: boolean; // when true, storefront shows "Preorder" instead of "Buy Now"
  preorderNote: string; // optional note shown near the preorder CTA, e.g. estimated ready date
  stock: number; // units in stock
  lowStockThreshold: number; // stock at/below this is flagged low
  images: string[];
  colors: string[];
  sizes: string[];
  materials: string[];
  sizePrices: Record<string, number>; // size name -> absolute price (replaces base price)
  sizeDiscounts: Record<string, number>; // size name -> discount value override (same unit as discountType); falls back to discountValue when unset
  materialPrices: Record<string, number>; // material name -> price delta from base
  colorImages: Record<string, string[]>; // color name -> gallery images for that color
  materialImages: Record<string, string[]>; // material name -> gallery images for that material
};

export type CartLine = {
  productId: string;
  color: string;
  size: string;
  material: string;
  qty: number;
};

export type OrderItem = {
  productId: string;
  title: string;
  image: string;
  color: string;
  size: string;
  material: string;
  qty: number;
  price: number;
  costPrice: number;
};

export type Order = {
  id: string;
  createdAt: string; // ISO
  customerFullName: string;
  customerPhone: string;
  customerAddress: string;
  region: string;
  city: string;
  township: string;
  deliveryFee: number;
  paymentMethod: string;
  notes: string;
  items: OrderItem[];
  total: number;
  invoiceDataUrl: string | null;
  invoiceName: string | null;
  status: "pending" | "confirmed" | "shipped" | "completed";
};
