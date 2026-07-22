import { Container } from "@/components/container";

const SECTIONS = [
  {
    title: "Orders & Pricing",
    body: "All prices are listed in MMK and include the base product cost — size and material selections may change the final price as shown on the product page before checkout. We reserve the right to correct pricing errors and to update prices at any time without notice.",
  },
  {
    title: "Production Time",
    body: "Every item is 3D printed to order. Production typically takes 2-5 business days before an order ships, and this can extend for larger items, custom sizes, or high order volume.",
  },
  {
    title: "Shipping",
    body: "Shipping cost and delivery time are calculated after an order is placed and confirmed with the customer directly. Delivery estimates are approximate and not guaranteed.",
  },
  {
    title: "Returns & Refunds",
    body: "Because products are made to order, we don't accept returns for change of mind. If an item arrives damaged, defective, or significantly different from what was ordered, contact us within 3 days of delivery with photos so we can arrange a replacement or refund.",
  },
  {
    title: "Product Appearance",
    body: "Product photos are taken from real prints, but on-screen colors and lighting may vary slightly from the finished item. Minor layer lines or texture are normal for 3D printed products and aren't considered defects.",
  },
  {
    title: "Liability",
    body: "3D Kulture is not liable for indirect or incidental damages arising from the use of purchased products. Products are decorative collectibles unless stated otherwise, and are not toys for children under 3 due to small parts.",
  },
  {
    title: "Contact",
    body: "Questions about these terms can be sent to 3dkultureburma@gmail.com or through the contact details in the footer.",
  },
];

export default function TermsPage() {
  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Terms & Conditions</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">
        By ordering from 3D Kulture, you agree to the terms below. We may update these terms from time to time.
      </p>

      <div className="mt-5 grid gap-6 rounded-[20px] border border-border bg-white p-6 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{section.body}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
