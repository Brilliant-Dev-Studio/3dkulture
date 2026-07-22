import { Container } from "@/components/container";
import { AccordionSection } from "@/components/accordion";

const FAQ_ITEMS = [
  {
    q: "What materials are the products printed in?",
    a: "Most items are printed in PLA, ABS, or Resin depending on the product — the available options are shown on each product page. Resin gives the finest detail, while PLA/ABS are more durable for everyday handling.",
  },
  {
    q: "Can I customize the size?",
    a: "Yes. Many products offer multiple size options with their own pricing — pick the size that fits your budget and display space on the product page before adding to cart.",
  },
  {
    q: "How long does an order take to arrive?",
    a: "Print and prep time is typically 2-5 business days, plus shipping time depending on your location within Myanmar. You'll be contacted to confirm details after placing an order.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We currently confirm orders and payment manually after checkout — our team will reach out via phone to arrange payment once your order is received.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Since every piece is printed to order, we don't accept returns for change of mind. If an item arrives damaged or defective, contact us within 3 days of delivery and we'll arrange a replacement.",
  },
  {
    q: "Do product photos match the actual item exactly?",
    a: "Photos are taken from real prints, but color may vary slightly between screens and print batches. Reach out if you need exact color matching before ordering.",
  },
];

export default function FaqPage() {
  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Frequently Asked Questions</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">
        Answers to the most common questions about ordering from 3D Kulture. Still need help? Contact us — details
        are in the footer below.
      </p>

      <div className="mt-5 rounded-[20px] border border-border bg-white px-5">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionSection key={item.q} title={item.q} defaultOpen={i === 0}>
            <p className="max-w-2xl text-sm leading-6 text-muted">{item.a}</p>
          </AccordionSection>
        ))}
      </div>
    </Container>
  );
}
