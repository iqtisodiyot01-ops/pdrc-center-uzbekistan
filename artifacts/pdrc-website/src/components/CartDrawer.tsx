import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  X, ShoppingCart, Plus, Minus, Trash2, Package,
  CreditCard, ExternalLink, ArrowRight, ChevronLeft, CheckCircle2,
  ShoppingBag, Tag, Copy, Check, Loader2, Truck,
} from "lucide-react";
import { useAppStore } from "@/store/use-store";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  price: number; discountPrice?: number | null; imageUrl?: string | null; category: string;
}
interface CartRow { id: number; quantity: number; createdAt: string; product: Product | null; }
interface OrderItem { productId: number; productName: string; price: number; quantity: number; }

interface PaymentMethodsResponse {
  payme?: { enabled: true };
  click?: { enabled: true };
  uzumbank?: { enabled: true };
  paynet?: { enabled: true };
  visaCard?: { enabled: true; cardNumber: string; cardNumberMasked: string; cardHolder: string };
  uzcardCard?: { enabled: true; cardNumber: string; cardNumberMasked: string; cardHolder: string };
}

interface DeliveryZone {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  price: number; estimatedTime: string; isActive: boolean; sortOrder: number;
}

interface CartDrawerProps { open: boolean; onClose: () => void; }

function CopyableCard({ cardNumber, cardHolder, lang }: { cardNumber: string; cardHolder: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copyCard = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, "")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="bg-gradient-to-br from-[#0f3460] to-[#1a4f8a] rounded-2xl p-4 text-white shadow-lg mt-2">
      <div className="flex items-center justify-between mb-4">
        <CreditCard size={20} className="text-blue-200" />
        <span className="text-xs text-blue-200 font-medium uppercase tracking-wider">
          {lang === "uz" ? "O'tkazma karta" : lang === "ru" ? "Карта для перевода" : "Transfer Card"}
        </span>
      </div>
      <div className="font-mono text-lg font-bold tracking-[0.15em] mb-3 flex items-center gap-3">
        <span>{cardNumber || "•••• •••• •••• ••••"}</span>
        <button
          onClick={copyCard}
          className="ml-auto p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {copied ? <Check size={14} className="text-green-300" /> : <Copy size={14} className="text-blue-200" />}
        </button>
      </div>
      {cardHolder && (
        <div className="text-xs text-blue-200 uppercase tracking-widest">{cardHolder}</div>
      )}
      <p className="text-[10px] text-blue-300/70 mt-3">
        {lang === "uz"
          ? "Yuqoridagi karta raqamiga to'lov summasi o'tkazing va admin bilan bog'laning"
          : lang === "ru"
          ? "Переведите сумму оплаты на карту выше и свяжитесь с администратором"
          : "Transfer the payment amount to the card above and contact admin"}
      </p>
    </div>
  );
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { lang, token } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", deliveryAddress: "" });
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [redirectLoading, setRedirectLoading] = useState<string | null>(null);
  const [shownCard, setShownCard] = useState<"visaCard" | "uzcardCard" | null>(null);

  const t = {
    uz: {
      title: "Mening savatim", empty: "Savat bo'sh", emptyDesc: "Hali hech narsa qo'shilmagan",
      toCatalog: "Katalogga o'tish", total: "Jami summa", order: "Buyurtma rasmiylashtirish",
      back: "Savatga qaytish", fullName: "To'liq ism", phone: "Telefon raqam",
      address: "Yetkazib berish manzili", confirm: "Tasdiqlash",
      successTitle: "Buyurtma qabul qilindi!", successDesc: (id: number) => `Buyurtma №${id} muvaffaqiyatli yuborildi.`,
      payNow: (pm: string) => `${pm} orqali to'lash`, payLater: "Keyinroq to'layman",
      close: "Yopish", items: (n: number) => `${n} ta mahsulot`, som: "so'm",
      choosePayment: "To'lov usulini tanlang", intlCards: "Xalqaro kartalar (Visa / Mastercard)",
      uzbCards: "Uzcard / Humo kartalar", directTransfer: "Karta raqamiga o'tkazma",
      noMethods: "To'lov usuli sozlanmagan. Admin bilan bog'laning.", sending: "Yuborilmoqda...",
      redirect: "Yo'naltirilmoqda...",
    },
    ru: {
      title: "Моя корзина", empty: "Корзина пуста", emptyDesc: "Добавьте товары из каталога",
      toCatalog: "Перейти в каталог", total: "Итого", order: "Оформить заказ",
      back: "Назад в корзину", fullName: "Полное имя", phone: "Номер телефона",
      address: "Адрес доставки", confirm: "Подтвердить заказ",
      successTitle: "Заказ принят!", successDesc: (id: number) => `Заказ №${id} оформлен.`,
      payNow: (pm: string) => `Оплатить через ${pm}`, payLater: "Оплачу позже",
      close: "Закрыть", items: (n: number) => `${n} товаров`, som: "сум",
      choosePayment: "Выберите способ оплаты", intlCards: "Международные карты (Visa / Mastercard)",
      uzbCards: "Карты Uzcard / Humo", directTransfer: "Перевод на карту",
      noMethods: "Способы оплаты не настроены. Свяжитесь с администратором.", sending: "Отправка...",
      redirect: "Перенаправление...",
    },
    en: {
      title: "My Cart", empty: "Your cart is empty", emptyDesc: "Add products from the catalog",
      toCatalog: "Go to catalog", total: "Total", order: "Place Order",
      back: "Back to cart", fullName: "Full name", phone: "Phone number",
      address: "Delivery address", confirm: "Confirm order",
      successTitle: "Order placed!", successDesc: (id: number) => `Order #${id} placed successfully.`,
      payNow: (pm: string) => `Pay with ${pm}`, payLater: "Pay later",
      close: "Close", items: (n: number) => `${n} items`, som: "UZS",
      choosePayment: "Choose payment method", intlCards: "International Cards (Visa / Mastercard)",
      uzbCards: "Uzcard / Humo Cards", directTransfer: "Direct card transfer",
      noMethods: "No payment methods configured. Contact admin.", sending: "Sending...",
      redirect: "Redirecting...",
    },
  }[lang as "uz" | "ru" | "en"] ?? {
    title: "Cart", empty: "Empty", emptyDesc: "Add products", toCatalog: "Catalog",
    total: "Total", order: "Order", back: "Back", fullName: "Name", phone: "Phone",
    address: "Address", confirm: "Confirm", successTitle: "Done!",
    successDesc: (id: number) => `Order #${id}`, payNow: (pm: string) => `Pay ${pm}`,
    payLater: "Later", close: "Close", items: (n: number) => `${n}`, som: "UZS",
    choosePayment: "Choose payment", intlCards: "International", uzbCards: "Local",
    directTransfer: "Card transfer", noMethods: "No payment methods.", sending: "Sending...", redirect: "...",
  };

  const { data: cartRows = [] } = useQuery<CartRow[]>({
    queryKey: ["cart"],
    queryFn: () => api.get<CartRow[]>("/cart"),
    enabled: !!token && open,
  });

  const { data: paymentMethods } = useQuery<PaymentMethodsResponse>({
    queryKey: ["payment-methods-details"],
    queryFn: () => api.get<PaymentMethodsResponse>("/payment-methods/details"),
    enabled: open && !!token,
  });

  const { data: deliveryZones = [] } = useQuery<DeliveryZone[]>({
    queryKey: ["delivery-zones"],
    queryFn: () => api.get<DeliveryZone[]>("/delivery-zones"),
    enabled: open,
  });

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => api.put(`/cart/${id}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: (id: number) => api.delete(`/cart/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const placeOrder = useMutation({
    mutationFn: (payload: { fullName: string; phone: string; deliveryAddress: string; paymentMethod: string; items: OrderItem[]; total: number; deliveryZoneName?: string; deliveryPrice?: number }) =>
      api.post<{ id: number }>("/orders", payload),
    onSuccess: (data) => {
      setCreatedOrderId(data.id);
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast({ title: lang === "uz" ? "Xatolik" : lang === "ru" ? "Ошибка" : "Error", variant: "destructive" }),
  });

  const getProductName = (p: Product) => lang === "ru" ? p.nameRu : lang === "en" ? p.nameEn : p.nameUz;
  const getEffectivePrice = (p: Product) => (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
  const itemsTotal = cartRows.reduce((sum, row) => sum + getEffectivePrice(row.product || { id: 0, nameUz: "", nameEn: "", nameRu: "", price: 0, category: "" }) * row.quantity, 0);
  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId) ?? null;
  const deliveryPrice = selectedZone?.price ?? 0;
  const total = itemsTotal + deliveryPrice;
  const itemCount = cartRows.reduce((sum, row) => sum + row.quantity, 0);

  const getZoneName = (z: DeliveryZone) => lang === "ru" ? z.nameRu : lang === "en" ? z.nameEn : z.nameUz;

  const handleOrder = () => {
    if (!form.fullName || !form.phone || !form.deliveryAddress) {
      toast({ title: lang === "uz" ? "Barcha maydonlarni to'ldiring" : lang === "ru" ? "Заполните все поля" : "Fill all fields", variant: "destructive" });
      return;
    }
    const items: OrderItem[] = cartRows.filter((r) => r.product).map((r) => ({
      productId: r.product!.id, productName: getProductName(r.product!),
      price: getEffectivePrice(r.product!), quantity: r.quantity,
    }));
    placeOrder.mutate({
      ...form, paymentMethod: "pending", items, total,
      ...(selectedZone ? { deliveryZoneName: getZoneName(selectedZone), deliveryPrice: selectedZone.price } : {}),
    });
  };

  const handleRedirectPayment = async (method: "payme" | "click" | "uzumbank" | "paynet", orderId: number) => {
    setRedirectLoading(method);
    try {
      await api.patch(`/orders/${orderId}/payment-method`, { paymentMethod: method });
      const data = await api.get<{ url: string }>(`/payments/checkout-url/${orderId}`);
      window.location.href = data.url;
    } catch {
      toast({ title: lang === "uz" ? "To'lov tizimi sozlanmagan" : lang === "ru" ? "Платёжная система не настроена" : "Payment not configured", variant: "destructive" });
      setRedirectLoading(null);
    }
  };

  const handleClose = () => {
    setCreatedOrderId(null);
    setCheckout(false);
    setShownCard(null);
    setRedirectLoading(null);
    setSelectedZoneId(null);
    onClose();
  };

  const hasAnyMethod = paymentMethods && Object.keys(paymentMethods).length > 0;
  const hasIntl = paymentMethods && !!(paymentMethods.payme || paymentMethods.click || paymentMethods.visaCard);
  const hasLocal = paymentMethods && !!(paymentMethods.uzumbank || paymentMethods.paynet || paymentMethods.uzcardCard);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[200]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 350, mass: 0.8 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white z-[201] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#0f3460] to-[#1a4f8a] px-5 pt-5 pb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                    {createdOrderId ? <CheckCircle2 size={18} className="text-green-300" /> : <ShoppingCart size={18} className="text-white" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base leading-none">
                      {createdOrderId ? t.successTitle : t.title}
                    </h2>
                    {!createdOrderId && cartRows.length > 0 && (
                      <p className="text-blue-200 text-xs mt-0.5">{t.items(itemCount)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              {!createdOrderId && !checkout && cartRows.length > 0 && (
                <div className="bg-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between">
                  <span className="text-white/80 text-xs font-medium">{t.total}</span>
                  <span className="text-white font-bold text-sm">{total.toLocaleString()} {t.som}</span>
                </div>
              )}
            </div>

            {/* ── STEP 3: PAYMENT SELECTION ── */}
            {createdOrderId !== null ? (
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-gray-600">{t.successDesc(createdOrderId)}</p>
                  <p className="text-base font-bold text-gray-900 mt-2">{t.choosePayment}</p>
                </div>

                {!hasAnyMethod && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-sm text-amber-700">
                    {t.noMethods}
                  </div>
                )}

                {hasIntl && (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t.intlCards}</h3>
                    <div className="space-y-2">
                      {paymentMethods?.payme && (
                        <button
                          onClick={() => handleRedirectPayment("payme", createdOrderId)}
                          disabled={redirectLoading !== null}
                          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:border-blue-400 hover:from-blue-100 hover:to-blue-200/50 transition-all disabled:opacity-50 text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">P</div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-gray-900 text-sm block">Payme</span>
                            <span className="text-xs text-gray-500">Visa, Mastercard</span>
                          </div>
                          {redirectLoading === "payme" ? <Loader2 size={18} className="animate-spin text-blue-600 shrink-0" /> : <ExternalLink size={16} className="text-blue-400 shrink-0" />}
                        </button>
                      )}

                      {paymentMethods?.click && (
                        <button
                          onClick={() => handleRedirectPayment("click", createdOrderId)}
                          disabled={redirectLoading !== null}
                          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 hover:border-green-400 hover:from-green-100 hover:to-green-200/50 transition-all disabled:opacity-50 text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-black text-sm shrink-0">C</div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-gray-900 text-sm block">Click</span>
                            <span className="text-xs text-gray-500">Visa, Mastercard</span>
                          </div>
                          {redirectLoading === "click" ? <Loader2 size={18} className="animate-spin text-green-600 shrink-0" /> : <ExternalLink size={16} className="text-green-400 shrink-0" />}
                        </button>
                      )}

                      {paymentMethods?.visaCard && (
                        <div>
                          <button
                            onClick={() => setShownCard(shownCard === "visaCard" ? null : "visaCard")}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100/50 hover:border-purple-400 hover:from-purple-100 hover:to-purple-200/50 transition-all text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
                              <CreditCard size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-gray-900 text-sm block">{t.directTransfer}</span>
                              <span className="text-xs text-gray-500">Visa / Mastercard</span>
                            </div>
                            <ArrowRight size={16} className={`text-purple-400 shrink-0 transition-transform ${shownCard === "visaCard" ? "rotate-90" : ""}`} />
                          </button>
                          {shownCard === "visaCard" && (
                            <CopyableCard
                              cardNumber={paymentMethods.visaCard.cardNumber}
                              cardHolder={paymentMethods.visaCard.cardHolder as string}
                              lang={lang}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {hasLocal && (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t.uzbCards}</h3>
                    <div className="space-y-2">
                      {paymentMethods?.uzumbank && (
                        <button
                          onClick={() => handleRedirectPayment("uzumbank", createdOrderId)}
                          disabled={redirectLoading !== null}
                          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100/50 hover:border-orange-400 hover:from-orange-100 hover:to-orange-200/50 transition-all disabled:opacity-50 text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-sm shrink-0">U</div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-gray-900 text-sm block">Uzumbank</span>
                            <span className="text-xs text-gray-500">Uzcard, Humo</span>
                          </div>
                          {redirectLoading === "uzumbank" ? <Loader2 size={18} className="animate-spin text-orange-600 shrink-0" /> : <ExternalLink size={16} className="text-orange-400 shrink-0" />}
                        </button>
                      )}

                      {paymentMethods?.paynet && (
                        <button
                          onClick={() => handleRedirectPayment("paynet", createdOrderId)}
                          disabled={redirectLoading !== null}
                          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100/50 hover:border-teal-400 hover:from-teal-100 hover:to-teal-200/50 transition-all disabled:opacity-50 text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-sm shrink-0">N</div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-gray-900 text-sm block">Paynet</span>
                            <span className="text-xs text-gray-500">Uzcard, Humo</span>
                          </div>
                          {redirectLoading === "paynet" ? <Loader2 size={18} className="animate-spin text-teal-600 shrink-0" /> : <ExternalLink size={16} className="text-teal-400 shrink-0" />}
                        </button>
                      )}

                      {paymentMethods?.uzcardCard && (
                        <div>
                          <button
                            onClick={() => setShownCard(shownCard === "uzcardCard" ? null : "uzcardCard")}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-indigo-100/50 hover:border-indigo-400 hover:from-indigo-100 hover:to-indigo-200/50 transition-all text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                              <CreditCard size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-gray-900 text-sm block">{t.directTransfer}</span>
                              <span className="text-xs text-gray-500">Uzcard / Humo</span>
                            </div>
                            <ArrowRight size={16} className={`text-indigo-400 shrink-0 transition-transform ${shownCard === "uzcardCard" ? "rotate-90" : ""}`} />
                          </button>
                          {shownCard === "uzcardCard" && (
                            <CopyableCard
                              cardNumber={paymentMethods.uzcardCard.cardNumber}
                              cardHolder={paymentMethods.uzcardCard.cardHolder as string}
                              lang={lang}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleClose}
                    className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    {t.payLater}
                  </button>
                </div>
              </div>

            ) : checkout ? (
              /* ── STEP 2: CHECKOUT FORM ── */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <button onClick={() => setCheckout(false)} className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 text-sm font-semibold transition-colors">
                    <ChevronLeft size={16} />{t.back}
                  </button>
                </div>

                <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
                  {/* Order summary mini */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="space-y-2 mb-3">
                      {cartRows.filter((r) => r.product).map((row) => (
                        <div key={row.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                            {row.product!.imageUrl ? (
                              <img src={row.product!.imageUrl} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                                <Package size={12} className="text-gray-400" />
                              </div>
                            )}
                            <span className="text-gray-700 truncate">{getProductName(row.product!)} × {row.quantity}</span>
                          </div>
                          <span className="font-semibold text-gray-900 shrink-0 text-xs">
                            {(getEffectivePrice(row.product!) * row.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-200 space-y-1.5">
                      {selectedZone && (
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Truck size={11} />{getZoneName(selectedZone)}</span>
                          <span>+ {deliveryPrice.toLocaleString()} {t.som}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-600">{t.total}</span>
                        <span className="font-bold text-base text-[#0f3460]">{total.toLocaleString()} {t.som}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery zone */}
                  {deliveryZones.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <Truck size={12} />
                        {lang === "uz" ? "Yetkazib berish zonasi" : lang === "ru" ? "Зона доставки" : "Delivery zone"}
                      </label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setSelectedZoneId(null)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm border transition-all ${selectedZoneId === null ? "border-blue-500 bg-blue-50 text-blue-800 font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                        >
                          <span>{lang === "uz" ? "O'zim olib ketaman" : lang === "ru" ? "Самовывоз" : "Self pickup"}</span>
                          <span className="text-xs font-bold text-green-600">{lang === "uz" ? "Bepul" : lang === "ru" ? "Бесплатно" : "Free"}</span>
                        </button>
                        {deliveryZones.map((z) => (
                          <button
                            key={z.id}
                            type="button"
                            onClick={() => setSelectedZoneId(z.id)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm border transition-all ${selectedZoneId === z.id ? "border-blue-500 bg-blue-50 text-blue-800 font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                          >
                            <span className="text-left">
                              <span className="block">{getZoneName(z)}</span>
                              <span className="text-[11px] font-normal text-gray-400">{z.estimatedTime}</span>
                            </span>
                            <span className="text-xs font-bold text-[#0f3460] shrink-0 ml-2">{z.price > 0 ? `${z.price.toLocaleString()} ${t.som}` : (lang === "uz" ? "Bepul" : lang === "ru" ? "Бесплатно" : "Free")}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form fields */}
                  {[
                    { key: "fullName", label: t.fullName, type: "text", ph: lang === "uz" ? "Ism va familiya" : lang === "ru" ? "Имя и фамилия" : "Full name" },
                    { key: "phone", label: t.phone, type: "tel", ph: "+998 90 123 45 67" },
                    { key: "deliveryAddress", label: t.address, type: "textarea", ph: lang === "uz" ? "Shahar, ko'cha, uy..." : lang === "ru" ? "Город, улица, дом..." : "City, street, house..." },
                  ].map(({ key, label, type, ph }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
                      {type === "textarea" ? (
                        <textarea
                          value={(form as Record<string, string>)[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          rows={2}
                          placeholder={ph}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        />
                      ) : (
                        <input
                          type={type}
                          value={(form as Record<string, string>)[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          placeholder={ph}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={handleOrder}
                    disabled={placeOrder.isPending}
                    className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                  >
                    {placeOrder.isPending ? (
                      <><Loader2 size={16} className="animate-spin" />{t.sending}</>
                    ) : (
                      <><ArrowRight size={16} />{t.confirm}</>
                    )}
                  </button>
                </div>
              </div>

            ) : (
              /* ── STEP 1: CART ITEMS ── */
              <div className="flex-1 flex flex-col overflow-hidden">
                {cartRows.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-5">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                      className="relative"
                    >
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-6xl select-none" role="img" aria-label="crying">😢</span>
                      </div>
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow"
                      >
                        <ShoppingBag size={16} className="text-blue-500" />
                      </motion.div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <h3 className="text-lg font-bold text-gray-800 mb-1.5">{t.empty}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{t.emptyDesc}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Link
                        href="/shop"
                        onClick={handleClose}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all text-sm"
                      >
                        <Tag size={15} />
                        {t.toCatalog}
                        <ArrowRight size={15} />
                      </Link>
                    </motion.div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                      <AnimatePresence initial={false}>
                        {cartRows.map((row, i) => {
                          if (!row.product) return null;
                          const p = row.product;
                          const effectivePrice = getEffectivePrice(p);
                          const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                          return (
                            <motion.div
                              key={row.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.2 }}
                              className="flex gap-3 bg-white rounded-2xl p-3 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all"
                            >
                              {p.imageUrl ? (
                                <img src={p.imageUrl} className="w-20 h-20 rounded-xl object-cover shrink-0" alt={getProductName(p)} />
                              ) : (
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                                  <Package size={22} className="text-gray-300" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{getProductName(p)}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="font-bold text-[#0f3460] text-sm">{effectivePrice.toLocaleString()} {t.som}</span>
                                    {hasDiscount && (
                                      <span className="text-xs text-gray-400 line-through">{p.price.toLocaleString()}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                                    <button
                                      onClick={() => row.quantity > 1 ? updateQty.mutate({ id: row.id, quantity: row.quantity - 1 }) : removeItem.mutate(row.id)}
                                      className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                      {row.quantity === 1 ? <Trash2 size={11} className="text-red-400" /> : <Minus size={11} />}
                                    </button>
                                    <span className="w-7 text-center text-sm font-bold text-gray-800">{row.quantity}</span>
                                    <button
                                      onClick={() => updateQty.mutate({ id: row.id, quantity: row.quantity + 1 })}
                                      className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                  <span className="text-xs text-gray-400">{effectivePrice.toLocaleString()} × {row.quantity}</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/50 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-sm text-gray-500 font-medium">{t.total}</span>
                        <span className="text-xl font-bold text-gray-900">{total.toLocaleString()} <span className="text-sm font-normal text-gray-500">{t.som}</span></span>
                      </div>
                      <button
                        onClick={() => setCheckout(true)}
                        className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-2xl hover:bg-blue-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-sm"
                      >
                        {t.order}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
