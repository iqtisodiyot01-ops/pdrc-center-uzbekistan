import { useAppStore } from "@/store/use-store";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Truck, Clock, CreditCard, Phone, CheckCircle2,
  Package, MapPin, Send, ShieldCheck, Banknote,
  Globe, Wallet, Building, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

/* ─── Icon map ─── */
const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Truck, Package, Globe, Send, CreditCard, Banknote, Wallet, Building, Phone,
  Box: Package, Plane: Send, Ship: Truck, QrCode: CreditCard, Landmark: Building,
};

/* ─── Color map ─── */
type ColorKey = "green" | "blue" | "purple" | "orange" | "red" | "teal";
const COLOR_MAP: Record<ColorKey, { bg: string; border: string; text: string; badge: string }> = {
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700" },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-700",   badge: "bg-teal-100 text-teal-700" },
};

interface Zone {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  icon: string; color: string; estimatedTime: string;
  priceTextUz: string; priceTextEn: string; priceTextRu: string;
  priceSubtextUz: string; priceSubtextEn: string; priceSubtextRu: string;
}
interface PagePayment {
  id: number; icon: string;
  titleUz: string; titleEn: string; titleRu: string;
  descUz: string; descEn: string; descRu: string;
}

export default function Delivery() {
  const { lang } = useAppStore();

  const { data: zones = [], isLoading: zonesLoading } = useQuery<Zone[]>({
    queryKey: ["delivery-zones"],
    queryFn: () => api.get<Zone[]>("/delivery-zones"),
  });

  const { data: pagePayments = [], isLoading: paysLoading } = useQuery<PagePayment[]>({
    queryKey: ["delivery-page-payments"],
    queryFn: () => api.get<PagePayment[]>("/delivery-page-payments"),
  });

  const t = {
    uz: {
      hero_label: "PDR Center Uzbekistan",
      hero_title: "Yetkazib berish va to'lov",
      hero_sub: "Toshkent va butun O'zbekiston bo'ylab tez va xavfsiz yetkazib berish",
      zones_title: "Yetkazib berish zonalari",
      payment_title: "To'lov usullari",
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
      payment_title: "Способы оплаты",
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
      payment_title: "Payment Methods",
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

  const getZoneName = (z: Zone) => lang === "ru" ? z.nameRu : lang === "en" ? z.nameEn : z.nameUz;
  const getZonePriceText = (z: Zone) => lang === "ru" ? z.priceTextRu : lang === "en" ? z.priceTextEn : z.priceTextUz;
  const getZonePriceSubtext = (z: Zone) => lang === "ru" ? z.priceSubtextRu : lang === "en" ? z.priceSubtextEn : z.priceSubtextUz;
  const getPayTitle = (py: PagePayment) => lang === "ru" ? py.titleRu : lang === "en" ? py.titleEn : py.titleUz;
  const getPayDesc = (py: PagePayment) => lang === "ru" ? py.descRu : lang === "en" ? py.descEn : py.descUz;

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

          {zonesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
          ) : zones.length === 0 ? (
            /* Fallback hardcoded zones if DB is empty */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: MapPin, title: lang === "uz" ? "Toshkent shahri" : lang === "ru" ? "Город Ташкент" : "Tashkent City", time: lang === "uz" ? "1–2 ish kuni" : lang === "ru" ? "1–2 рабочих дня" : "1–2 business days", price: lang === "uz" ? "Bepul (500 000 UZS dan yuqori buyurtma)" : lang === "ru" ? "Бесплатно (заказ от 500 000 UZS)" : "Free (orders over 500,000 UZS)", subtext: lang === "uz" ? "30 000 UZS (kichik buyurtma)" : lang === "ru" ? "30 000 UZS (небольшой заказ)" : "30,000 UZS (small orders)", color: COLOR_MAP["green"] },
                { icon: Truck, title: lang === "uz" ? "Viloyatlar (O'zbekiston)" : lang === "ru" ? "Регионы Узбекистана" : "Uzbekistan Regions", time: lang === "uz" ? "3–7 ish kuni" : lang === "ru" ? "3–7 рабочих дней" : "3–7 business days", price: lang === "uz" ? "50 000 – 100 000 UZS" : lang === "ru" ? "50 000 – 100 000 UZS" : "50,000 – 100,000 UZS", subtext: lang === "uz" ? "Kuryerlik xizmati orqali" : lang === "ru" ? "Через курьерскую службу" : "Via courier service", color: COLOR_MAP["blue"] },
                { icon: Package, title: lang === "uz" ? "Xalqaro yetkazib berish" : lang === "ru" ? "Международная доставка" : "International", time: lang === "uz" ? "7–14 kun" : lang === "ru" ? "7–14 дней" : "7–14 days", price: lang === "uz" ? "Individual hisoblash" : lang === "ru" ? "Индивидуальный расчёт" : "Individual pricing", subtext: lang === "uz" ? "Xalqaro pochta / kuryer" : lang === "ru" ? "Международная почта / курьер" : "International post / courier", color: COLOR_MAP["purple"] },
              ].map((zone, i) => {
                const Icon = zone.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl border p-6 ${zone.color.bg} ${zone.color.border}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${zone.color.badge}`}><Icon size={22} /></div>
                    <h3 className={`text-base font-bold mb-3 ${zone.color.text}`}>{zone.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-gray-400 shrink-0" /><span className="text-gray-700">{zone.time}</span></div>
                      <div className="flex items-start gap-2 text-sm"><CreditCard size={14} className="text-gray-400 mt-0.5 shrink-0" /><div><div className="text-gray-700 font-semibold">{zone.price}</div><div className="text-gray-500 text-xs">{zone.subtext}</div></div></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {zones.map((zone, i) => {
                const color = COLOR_MAP[zone.color as ColorKey] ?? COLOR_MAP["blue"];
                const Icon = ICON_MAP[zone.icon] ?? Truck;
                return (
                  <motion.div key={zone.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl border p-6 ${color.bg} ${color.border}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.badge}`}><Icon size={22} /></div>
                    <h3 className={`text-base font-bold mb-3 ${color.text}`}>{getZoneName(zone)}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-gray-400 shrink-0" /><span className="text-gray-700">{zone.estimatedTime}</span></div>
                      {(getZonePriceText(zone) || getZonePriceSubtext(zone)) && (
                        <div className="flex items-start gap-2 text-sm">
                          <CreditCard size={14} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            {getZonePriceText(zone) && <div className="text-gray-700 font-semibold">{getZonePriceText(zone)}</div>}
                            {getZonePriceSubtext(zone) && <div className="text-gray-500 text-xs">{getZonePriceSubtext(zone)}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Payment Methods */}
      {(paysLoading || pagePayments.length > 0) && (
        <section className="py-14 md:py-20 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="section-badge-light mx-auto">PDR Center</div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">{p.payment_title}</h2>
            </div>
            {paysLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={28} /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {pagePayments.map((method) => {
                  const Icon = ICON_MAP[method.icon] ?? CreditCard;
                  return (
                    <div key={method.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center text-center hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 mb-3">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{getPayTitle(method)}</h3>
                      <p className="text-xs text-gray-500 leading-tight">{getPayDesc(method)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Order Steps */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">{p.steps_title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {p.steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative">
                {i < p.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-blue-200 z-0" style={{ width: "calc(100% - 3rem)", left: "calc(100% - 1.5rem)" }} />
                )}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative z-10">
                  <div className="w-10 h-10 bg-[#0f3460] text-white rounded-xl flex items-center justify-center font-display font-bold text-base mb-4">{step.n}</div>
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
            <a href="tel:+998905783272"
              className="px-8 py-4 bg-[#0f3460] text-white font-display font-bold uppercase tracking-wider rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
              <Phone size={16} /> {p.cta_btn}
            </a>
            <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer"
              className="px-8 py-4 bg-blue-50 text-[#0f3460] border border-blue-200 font-display font-bold uppercase tracking-wider rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
              <Send size={16} /> Telegram
            </a>
            <Link href="/shop"
              className="px-8 py-4 bg-gray-100 text-gray-700 border border-gray-200 font-display font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <Package size={16} /> {lang === "uz" ? "Katalog" : lang === "ru" ? "Каталог" : "Catalog"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
