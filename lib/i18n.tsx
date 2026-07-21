"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "my";

const DICT = {
  en: {
    "nav.search": "Search products",
    "nav.filters": "Filters",
    "nav.home": "Home",

    "home.bestSelling": "Best Selling Products",
    "home.bestSellingTag": "Trending now",
    "home.allProducts": "All Products",
    "home.shopNow": "Shop now",
    "home.shopAll": "Shop all products",

    "filter.title": "Filters",
    "filter.clearAll": "Clear all",
    "filter.category": "Category",
    "filter.color": "Color",
    "filter.size": "Size",
    "filter.price": "Price",
    "filter.showResults": "Show results",
    "filter.noResults": "No products match your search.",

    "product.soldSuffix": "sold",
    "product.color": "Color",
    "product.size": "Size",
    "product.material": "Material",
    "product.lowStockPrefix": "Hurry! Only",
    "product.lowStockSuffix": "left in stock.",
    "product.outOfStock": "Out of stock",
    "product.quantity": "Quantity",
    "product.addToCart": "Add to Cart",
    "product.addedToCart": "Added to Cart",
    "product.buyNow": "Buy Now",
    "product.needHelp": "Need help ordering? Contact our support team.",

    "cart.title": "Cart",
    "cart.empty": "Your cart is empty",
    "cart.continueShopping": "Continue shopping",
    "cart.product": "Product",
    "cart.price": "Price",
    "cart.quantity": "Quantity",
    "cart.subtotal": "Subtotal",
    "cart.orderNotes": "Order notes (optional)",
    "cart.orderNotesPlaceholder": "Notes about your order, e.g. delivery instructions",
    "cart.cartTotals": "Cart Totals",
    "cart.shippingNote": "Shipping & taxes calculated at checkout",
    "cart.proceedToCheckout": "Proceed to Checkout",
    "cart.nothingToCheckout": "Nothing to check out",

    "checkout.title": "Checkout",
    "checkout.backToCart": "Back to cart",
    "checkout.stepCart": "Cart",
    "checkout.stepShipping": "Shipping",
    "checkout.stepPayment": "Payment",
    "checkout.shippingDetails": "Shipping Details",
    "checkout.fullName": "Full name",
    "checkout.phone": "Phone number",
    "checkout.address": "Delivery address",
    "checkout.paymentInvoice": "Payment Invoice",
    "checkout.paymentInvoiceNote": "Upload your bank transfer invoice/receipt.",
    "checkout.placeOrder": "Place Order",
    "checkout.placingOrder": "Placing Order…",
    "checkout.secureNote": "Your information is safe with us",
    "checkout.orderSummary": "Order Summary",
    "checkout.shipping": "Shipping",
    "checkout.shippingCalculated": "Calculated after order",
    "checkout.total": "Total",
    "checkout.orderPlaced": "Order placed",
    "checkout.thanks": "Thanks — we'll confirm your order once payment is verified.",
    "checkout.emptyTitle": "Nothing to check out",
    "checkout.emptyBody": "Your cart is empty.",

    "footer.rights": "All Rights Reserved",
  },
  my: {
    "nav.search": "ကုန်ပစ္စည်း ရှာမည်",
    "nav.filters": "စစ်ထုတ်ရန်",
    "nav.home": "ပင်မစာမျက်နှာ",

    "home.bestSelling": "အရောင်းရဆုံး ကုန်ပစ္စည်းများ",
    "home.bestSellingTag": "လူကြိုက်များနေသည်",
    "home.allProducts": "ကုန်ပစ္စည်းအားလုံး",
    "home.shopNow": "ဝယ်ယူရန်",
    "home.shopAll": "ကုန်ပစ္စည်းအားလုံးကြည့်ရန်",

    "filter.title": "စစ်ထုတ်ရန်",
    "filter.clearAll": "အားလုံးရှင်းမည်",
    "filter.category": "အမျိုးအစား",
    "filter.color": "အရောင်",
    "filter.size": "အရွယ်အစား",
    "filter.price": "ဈေးနှုန်း",
    "filter.showResults": "ရလဒ်များကြည့်ရန်",
    "filter.noResults": "ရှာဖွေမှုနှင့် ကိုက်ညီသော ကုန်ပစ္စည်း မတွေ့ပါ။",

    "product.soldSuffix": "ရောင်းပြီး",
    "product.color": "အရောင်",
    "product.size": "အရွယ်အစား",
    "product.material": "ပစ္စည်းအမျိုးအစား",
    "product.lowStockPrefix": "အမြန်ဆုံးမှာယူပါ! ကျန်ရှိနေသည်",
    "product.lowStockSuffix": "ခုသာ။",
    "product.outOfStock": "ကုန်သွားပါပြီ",
    "product.quantity": "အရေအတွက်",
    "product.addToCart": "ခြင်းထဲထည့်မည်",
    "product.addedToCart": "ခြင်းထဲထည့်ပြီးပါပြီ",
    "product.buyNow": "ယခုဝယ်မည်",
    "product.needHelp": "အော်ဒါတင်ရန် အကူအညီလိုပါသလား? ကျွန်ုပ်တို့၏ Support အဖွဲ့ကို ဆက်သွယ်ပါ။",

    "cart.title": "ခြင်းလှော်",
    "cart.empty": "သင့်ခြင်းလှော် ဗလာဖြစ်နေပါသည်",
    "cart.continueShopping": "ဆက်လက်ဝယ်ယူမည်",
    "cart.product": "ကုန်ပစ္စည်း",
    "cart.price": "ဈေးနှုန်း",
    "cart.quantity": "အရေအတွက်",
    "cart.subtotal": "စုစုပေါင်း (အခွန်မပါ)",
    "cart.orderNotes": "အော်ဒါမှတ်ချက် (ရွေးချယ်ခွင့်)",
    "cart.orderNotesPlaceholder": "ပို့ဆောင်ရေးဆိုင်ရာ မှတ်ချက်များ ရေးထည့်ပါ",
    "cart.cartTotals": "စုစုပေါင်းငွေ",
    "cart.shippingNote": "ပို့ဆောင်ခနှင့် အခွန်ကို Checkout တွင် တွက်ချက်ပါမည်",
    "cart.proceedToCheckout": "Checkout သို့ဆက်သွားမည်",
    "cart.nothingToCheckout": "Checkout လုပ်စရာ မရှိပါ",

    "checkout.title": "Checkout",
    "checkout.backToCart": "ခြင်းလှော်သို့ ပြန်သွားမည်",
    "checkout.stepCart": "ခြင်းလှော်",
    "checkout.stepShipping": "ပို့ဆောင်ရေး",
    "checkout.stepPayment": "ငွေပေးချေမှု",
    "checkout.shippingDetails": "ပို့ဆောင်ရေးအချက်အလက်",
    "checkout.fullName": "အမည်အပြည့်အစုံ",
    "checkout.phone": "ဖုန်းနံပါတ်",
    "checkout.address": "ပို့ဆောင်ရမည့်လိပ်စာ",
    "checkout.paymentInvoice": "ငွေပေးချေမှု Invoice",
    "checkout.paymentInvoiceNote": "ငွေလွှဲဖြတ်ပိုင်း / ပြေစာကို တင်ပါ။",
    "checkout.placeOrder": "အော်ဒါတင်မည်",
    "checkout.placingOrder": "အော်ဒါတင်နေသည်…",
    "checkout.secureNote": "သင့်အချက်အလက်များ လုံခြုံပါသည်",
    "checkout.orderSummary": "အော်ဒါအကျဉ်းချုပ်",
    "checkout.shipping": "ပို့ဆောင်ခ",
    "checkout.shippingCalculated": "အော်ဒါတင်ပြီးမှ တွက်ချက်ပါမည်",
    "checkout.total": "စုစုပေါင်း",
    "checkout.orderPlaced": "အော်ဒါတင်ပြီးပါပြီ",
    "checkout.thanks": "ကျေးဇူးတင်ပါသည် — ငွေပေးချေမှု အတည်ပြုပြီးပါက အော်ဒါကို အတည်ပြုပေးပါမည်။",
    "checkout.emptyTitle": "Checkout လုပ်စရာ မရှိပါ",
    "checkout.emptyBody": "သင့်ခြင်းလှော် ဗလာဖြစ်နေပါသည်။",

    "footer.rights": "မူပိုင်ခွင့်အားလုံး ရရှိထားပါသည်",
  },
} as const;

type Key = keyof typeof DICT.en;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: Key) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "3dkulture:locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "my") setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => DICT[locale][key] ?? DICT.en[key] ?? key,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
