export type Product = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number; // MMK
  images: [string, string, string];
  colors: string[];
  sizes: string[];
};

export type CartLine = {
  productId: string;
  color: string;
  size: string;
  qty: number;
};
