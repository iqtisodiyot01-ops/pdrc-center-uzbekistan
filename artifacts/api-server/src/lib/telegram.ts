const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface OrderNotification {
  orderId: number;
  fullName: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: string;
  total: number;
  items: { productName: string; price: number; quantity: number }[];
}

export async function sendOrderNotification(order: OrderNotification): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not configured, skipping notification");
    return;
  }

  const itemLines = order.items
    .map((item) => `  • ${item.productName} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} so'm`)
    .join("\n");

  const paymentLabels: Record<string, string> = {
    cash: "Naqd pul",
    payme: "Payme",
    click: "Click",
    card: "Bank o'tkazmasi",
  };

  const text = [
    `🛒 *Yangi buyurtma \\#${order.orderId}*`,
    ``,
    `👤 *Mijoz:* ${escapeMarkdown(order.fullName)}`,
    `📞 *Telefon:* ${escapeMarkdown(order.phone)}`,
    `📍 *Manzil:* ${escapeMarkdown(order.deliveryAddress)}`,
    `💳 *To'lov:* ${escapeMarkdown(paymentLabels[order.paymentMethod] || order.paymentMethod)}`,
    ``,
    `📦 *Mahsulotlar:*`,
    escapeMarkdown(itemLines),
    ``,
    `💰 *Jami:* ${order.total.toLocaleString()} so'm`,
  ].join("\n");

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "MarkdownV2",
      }),
    });

    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error("Telegram API error:", resp.status, errorBody);
    }
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}

export interface BookingNotification {
  bookingId: number;
  type: string;
  name: string;
  phone: string;
  age?: string | null;
  address?: string | null;
  courseName?: string | null;
  serviceId?: number | null;
  message?: string | null;
}

export async function sendBookingNotification(booking: BookingNotification): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not configured, skipping notification");
    return;
  }

  const isCourse = booking.type === "course_enrollment";
  const header = isCourse ? `🎓 *Yangi kurs ro'yxatdan o'tish \\#${booking.bookingId}*` : `📅 *Yangi bron \\#${booking.bookingId}*`;

  const lines = [
    header,
    ``,
    `👤 *Ism:* ${escapeMarkdown(booking.name)}`,
    `📞 *Telefon:* ${escapeMarkdown(booking.phone)}`,
  ];

  if (booking.age) lines.push(`🎂 *Yoshi:* ${escapeMarkdown(booking.age)}`);
  if (booking.address) lines.push(`📍 *Manzil:* ${escapeMarkdown(booking.address)}`);
  if (booking.courseName) lines.push(`📚 *Kurs:* ${escapeMarkdown(booking.courseName)}`);
  if (booking.message) lines.push(``, `💬 *Xabar:* ${escapeMarkdown(booking.message)}`);

  const text = lines.join("\n");

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "MarkdownV2" }),
    });
    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error("Telegram API error:", resp.status, errorBody);
    }
  } catch (err) {
    console.error("Failed to send Telegram booking notification:", err);
  }
}

export interface ContactNotification {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  subject?: string | null;
  message: string;
}

export async function sendContactNotification(contact: ContactNotification): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const lines = [
    `✉️ *Yangi xabar \\#${contact.id}*`,
    ``,
    `👤 *Ism:* ${escapeMarkdown(contact.name)}`,
  ];
  if (contact.phone) lines.push(`📞 *Telefon:* ${escapeMarkdown(contact.phone)}`);
  if (contact.email) lines.push(`📧 *Email:* ${escapeMarkdown(contact.email)}`);
  if (contact.subject) lines.push(`📌 *Mavzu:* ${escapeMarkdown(contact.subject)}`);
  lines.push(``, `💬 *Xabar:* ${escapeMarkdown(contact.message)}`);

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: lines.join("\n"), parse_mode: "MarkdownV2" }),
    });
  } catch (err) {
    console.error("Failed to send Telegram contact notification:", err);
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}
