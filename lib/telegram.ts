import { formatMMK } from "./format";

type OrderNotification = {
  id: string;
  customerFullName: string;
  customerPhone: string;
  customerAddress: string;
  region: string;
  city: string;
  township: string;
  paymentMethod: string;
  total: number;
  items: { title: string; color: string; size: string; qty: number; price: number }[];
  invoiceUrl?: string | null;
};

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyNewOrderOnTelegram(order: OrderNotification) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const location = [order.township, order.city, order.region].filter(Boolean).join(", ");
  const itemLines = order.items
    .map((item) => {
      const variant = [item.color, item.size].filter(Boolean).join(" / ");
      return `• ${escapeHtml(item.title)}${variant ? ` (${escapeHtml(variant)})` : ""} × ${item.qty} — ${formatMMK(item.price * item.qty)}`;
    })
    .join("\n");

  const lines = [
    `🛒 <b>New Order</b>`,
    ``,
    `<b>Customer:</b> ${escapeHtml(order.customerFullName || "—")}`,
    `<b>Phone:</b> ${escapeHtml(order.customerPhone || "—")}`,
    location && `<b>Location:</b> ${escapeHtml(location)}`,
    order.customerAddress && `<b>Address:</b> ${escapeHtml(order.customerAddress)}`,
    order.paymentMethod && `<b>Payment:</b> ${escapeHtml(order.paymentMethod)}`,
    ``,
    itemLines,
    ``,
    `<b>Total: ${formatMMK(order.total)}</b>`,
    ``,
    `Order ID: <code>${order.id}</code>`,
  ].filter(Boolean);

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
      }),
    });

    if (order.invoiceUrl) {
      const isPdf = order.invoiceUrl.toLowerCase().endsWith(".pdf");
      const method = isPdf ? "sendDocument" : "sendPhoto";
      const fileField = isPdf ? "document" : "photo";
      const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          [fileField]: order.invoiceUrl,
          caption: `Payment receipt — order ${order.id}`,
        }),
      });
      if (!res.ok) console.error("Telegram invoice send failed:", await res.text());
    }
  } catch (err) {
    console.error("Telegram notification failed:", err);
  }
}
