import { useAppStore } from "@/store/use-store";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Truck, Clock, CreditCard, Phone, CheckCircle2,
  Package, MapPin, Send, ShieldCheck, Banknote
} from "lucide-react";

export default function Delivery() {
  const { lang } = useAppStore();

  const t = {
    uz: {
      hero_label: "PDR Center Uzbekistan",
      hero_title: "Yetkazib berish va to'lov",
      hero_sub: "Toshkent va butun O'zbekiston bo'ylab tez va xavfsiz yetkazib berish",
      zones_title: "Yetkazib berish zonalari",
      zones: [
        {
          icon: MapPin,
          title: "Toshkent shahri",
          time: "1–2 ish kuni",
          price: "Bepul (500 000 UZS dan yuqori buyurtma)",
          price_small: "30 000 UZS (kichik buyurtma)",
          color: "bg-green-50 border-green-200",
          accent: "text-green-700",
          badge: "bg-green-100 text-green-700",
        },
        {
          icon: Truck,
          title: "Viloyatlar (O'zbekiston)",
          time: "3–7 ish kuni",
          price: "50 000 – 100 000 UZS",
          price_small: "Kuryerlik xizmati orqali",
          color: "bg-blue-50 border-blue-200",
          accent: "text-blue-700",
          badge: "bg-blue-100 text-blue-700",
        },
        {
          icon: Package,
          title: "Xalqaro yetkazib berish",
          time: "7–14 kun",
          price: "Individual hisoblash",
          price_small: "Xalqaro pochta / kuryer",
          color: "bg-purple-50 border-purple-200",
          accent: "text-purple-700",
          badge: "bg-purple-100 text-purple-700",
        },
      ],
      payment_title: "To'lov usullari",
      payment: [
        { icon: Banknote, title: "Naqd pul", desc: "Yetkazib berilganda naqd to'lov" },
        { icon: CreditCard, title: "Payme", desc: "Payme orqali onlayn to'lov" },
        { icon: CreditCard, title: "Click", desc: "Click orqali onlayn to'lov" },
        { icon: CreditCard, title: "Uzcard / Humo", desc: "Plastik karta orqali to'lov" },
        { icon: Banknote, title: "Bank o'tkazmasi", desc: "Naqd o'tkazma / hisob-faktura" },
      ],
      steps_title: "Buyurtma qilish jarayoni",
      steps: [
        { n: "1", title: "Mahsulotni tanlang", desc: "Katalogdan kerakli mahsulotni toping va qo'shib qo'ying" },
        { n: "2", title: "Menejer bilan bog'laning", desc: "Telefon yoki Telegram orqali buyurtmani tasdiqlang" },
        { n: "3", title: "To'lovni amalga oshiring", desc: "Qulay to'lov usulini tanlang va to'lang" },
        { n: "4", title: "Yetkazib olasiz", desc: "Ko'rsatilgan manzilga belgilangan muddatda yetkazib beramiz" },
      ],
      guarantee_title: "Kafolatlar",
      guarantee: [
        "Barcha mahsulotlar original va sertifikatlangan",
        "Zararlangan holda yetkazilsa — bepul almashtirish",
        "Yetkazib berish muddatiga kafolat",
        "24/7 mijozlarni qo'llab-quvvatlash",
      ],
      cta_title: "Buyurtma bermoqchimisiz?",
      cta_desc: "Menejerimizga qo'ng'iroq qiling yoki Telegram orqali yozing.",
      cta_btn: "Qo'ng'iroq qilish",
    },
    ru: {
      hero_label: "PDR Center Uzbekistan",
      hero_title: "Доставка и оплата",
      hero_sub: "Быстрая и безопасная доставка по Ташкенту и всему Узбекистану",
      zones_title: "Зоны доставки",
      zones: [
        {
          icon: MapPin,
          title: "Город Ташкент",
          time: "1–2 рабочих дня",
          price: "Бесплатно (заказ от 500 000 UZS)",
          price_small: "30 000 UZS (небольшой заказ)",
          color: "bg-green-50 border-green-200",
          accent: "text-green-700",
          badge: "bg-green-100 text-green-700",
        },
        {
          icon: Truck,
          title: "Регионы Узбекистана",
          time: "3–7 рабочих дней",
          price: "50 000 – 100 000 UZS",
          price_small: "Через курьерскую службу",
          color: "bg-blue-50 border-blue-200",
          accent: "text-blue-700",
          badge: "bg-blue-100 text-blue-700",
        },
        {
          icon: Package,
          title: "Международная доставка",
          time: "7–14 дней",
          price: "Индивидуальный расчёт",
          price_small: "Международная почта / курьер",
          color: "bg-purple-50 border-purple-200",
          accent: "text-purple-700",
          badge: "bg-purple-100 text-purple-700",
        },
      ],
      payment_title: "Способы оплаты",
      payment: [
        { icon: Banknote, title: "Наличные", desc: "Оплата наличными при получении" },
        { icon: CreditCard, title: "Payme", desc: "Онлайн-оплата через Payme" },
        { icon: CreditCard, title: "Click", desc: "Онлайн-оплата через Click" },
        { icon: CreditCard, title: "Uzcard / Humo", desc: "Оплата банковской картой" },
        { icon: Banknote, title: "Банковский перевод", desc: "Безналичный перевод / счёт-фактура" },
      ],
      steps_title: "Как сделать заказ",
      steps: [
        { n: "1", title: "Выберите товар", desc: "Найдите нужный товар в каталоге и добавьте в корзину" },
        { n: "2", title: "Свяжитесь с менеджером", desc: "Подтвердите заказ по телефону или в Telegram" },
        { n: "3", title: "Оплатите заказ", desc: "Выберите удобный способ оплаты и оплатите" },
        { n: "4", title: "Получите заказ", desc: "Доставим по указанному адресу в оговорённые сроки" },
      ],
      guarantee_title: "Гарантии",
      guarantee: [
        "Все товары оригинальные и сертифицированные",
        "Повреждённый товар заменяем бесплатно",
        "Гарантия сроков доставки",
        "Поддержка клиентов 24/7",
      ],
      cta_title: "Хотите сделать заказ?",
      cta_desc: "Позвоните нашему менеджеру или напишите в Telegram.",
      cta_btn: "Позвонить",
    },
    en: {
      hero_label: "PDR Center Uzbekistan",
      hero_title: "Delivery & Payment",
      hero_sub: "Fast and safe delivery across Tashkent and all of Uzbekistan",
      zones_title: "Delivery Zones",
      zones: [
        {
          icon: MapPin,
          title: "Tashkent City",
          time: "1–2 business days",
          price: "Free (orders over 500,000 UZS)",
          price_small: "30,000 UZS (smaller orders)",
          color: "bg-green-50 border-green-200",
          accent: "text-green-700",
          badge: "bg-green-100 text-green-700",
        },
        {
          icon: Truck,
          title: "Uzbekistan Regions",
          time: "3–7 business days",
          price: "50,000 – 100,000 UZS",
          price_small: "Via courier service",
          color: "bg-blue-50 border-blue-200",
          accent: "text-blue-700",
          badge: "bg-blue-100 text-blue-700",
        },
        {
          icon: Package,
          title: "International",
          time: "7–14 days",
          price: "Individual pricing",
          price_small: "International post / courier",
          color: "bg-purple-50 border-purple-200",
          accent: "text-purple-700",
          badge: "bg-purple-100 text-purple-700",
        },
      ],
      payment_title: "Payment Methods",
      payment: [
        { icon: Banknote, title: "Cash", desc: "Cash on delivery" },
        { icon: CreditCard, title: "Payme", desc: "Online payment via Payme" },
        { icon: CreditCard, title: "Click", desc: "Online payment via Click" },
        { icon: CreditCard, title: "Uzcard / Humo", desc: "Bank card payment" },
        { icon: Banknote, title: "Bank Transfer", desc: "Wire transfer / invoice" },
      ],
      steps_title: "How to Order",
      steps: [
        { n: "1", title: "Choose a product", desc: "Find what you need in the catalog and add it to cart" },
        { n: "2", title: "Contact our manager", desc: "Confirm your order by phone or Telegram" },
        { n: "3", title: "Make payment", desc: "Choose a convenient payment method and pay" },
        { n: "4", title: "Receive your order", desc: "We'll deliver to your address within the stated timeframe" },
      ],
      guarantee_title: "Our Guarantees",
      guarantee: [
        "All products are original and certified",
        "Free replacement for damaged deliveries",
        "Delivery time guarantee",
        "24/7 customer support",
      ],
      cta_title: "Ready to Order?",
      cta_desc: "Call our manager or message us on Telegram.",
      cta_btn: "Call Now",
    },
  };

  const p = t[lang] ?? t.uz;

  return (
    <div className="w-full">

      {/* Hero */}
      <section className="bg-[#0f3460] py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="section-badge-dark mx-auto">
            <Truck size={13} /> {p.hero_label}
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight mb-4">
            {p.hero_title}
          </h1>
          <p className="text-blue-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">{p.hero_sub}</p>
        </div>
      </section>

      {/* Delivery Zones */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="section-badge-light mx-auto">PDR Center</div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">{p.zones_title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {p.zones.map((zone, i) => {
              const Icon = zone.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border p-6 ${zone.color}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${zone.badge}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className={`text-base font-bold mb-3 ${zone.accent}`}>{zone.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-gray-400 shrink-0" />
                      <span className="text-gray-700">{zone.time}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CreditCard size={14} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-gray-700 font-semibold">{zone.price}</div>
                        <div className="text-gray-500 text-xs">{zone.price_small}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-14 md:py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="section-badge-light mx-auto">PDR Center</div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">{p.payment_title}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {p.payment.map((method, i) => {
              const Icon = method.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center text-center hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 mb-3">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-xs text-gray-500 leading-tight">{method.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Order Steps */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">{p.steps_title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {p.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < p.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-blue-200 z-0" style={{ width: "calc(100% - 3rem)", left: "calc(100% - 1.5rem)" }} />
                )}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative z-10">
                  <div className="w-10 h-10 bg-[#0f3460] text-white rounded-xl flex items-center justify-center font-display font-bold text-base mb-4">
                    {step.n}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-14 md:py-20 bg-[#0f3460]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight">{p.guarantee_title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {p.guarantee.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl px-5 py-4 border border-white/10">
                <ShieldCheck size={18} className="text-blue-300 mt-0.5 shrink-0" />
                <span className="text-blue-100 text-sm leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] mb-4 leading-tight">{p.cta_title}</h2>
          <p className="text-gray-500 mb-8 text-sm">{p.cta_desc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+998905783272"
              className="px-8 py-4 bg-[#0f3460] text-white font-display font-bold uppercase tracking-wider rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={16} /> {p.cta_btn}
            </a>
            <a
              href="https://t.me/pdrtoolls"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-blue-50 text-[#0f3460] border border-blue-200 font-display font-bold uppercase tracking-wider rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} /> Telegram
            </a>
            <Link
              href="/shop"
              className="px-8 py-4 bg-gray-100 text-gray-700 border border-gray-200 font-display font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Package size={16} /> {lang === "uz" ? "Katalog" : lang === "ru" ? "Каталог" : "Catalog"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
