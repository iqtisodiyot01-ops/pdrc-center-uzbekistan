import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  X, ShoppingCart, Plus, Minus, Trash2, Phone, Send, Package,
  CreditCard, ExternalLink, ArrowRight, ChevronLeft, CheckCircle2,
  ShoppingBag, Tag,
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

interface CartDrawerProps { open: boolean; onClose: () => void; }

const PAYMENT_METHODS = [
  { value: "cash", uz: "Naqd pul", en: "Cash", ru: "Наличные", icon: "💵" },
  { value: "payme", uz: "Payme", en: "Payme", ru: "Payme", icon: "🔵", redirect: true },
  { value: "click", uz: "Click", en: "Click", ru: "Click", icon: "🟢", redirect: true },
  { value: "card", uz: "Bank o'tkazmasi", en: "Bank transfer", ru: "Банк. перевод", icon: "🏦" },
];

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { lang, token } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", deliveryAddress: "", paymentMethod: "cash" });
  const [orderSuccess, setOrderSuccess] = useState<{ id: number; paymentMethod: string } | null>(null);
  const [redirectLoading, setRedirectLoading] = useState(false);

  const { data: cartRows = [] } = useQuery<CartRow[]>({
    queryKey: ["cart"],
    queryFn: () => api.get<CartRow[]>("/cart"),
    enabled: !!token && open,
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
    mutationFn: (payload: { fullName: string; phone: string; deliveryAddress: string; paymentMethod: string; items: OrderItem[]; total: number }) =>
      api.post<{ id: number }>("/orders", payload),
    onSuccess: (data) => {
      setOrderSuccess({ id: data.id, paymentMethod: form.paymentMethod });
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast({ title: lang === "uz" ? "Xatolik" : lang === "ru" ? "Ошибка" : "Error", variant: "destructive" }),
  });

  const getProductName = (p: Product) => lang === "ru" ? p.nameRu : lang === "en" ? p.nameEn : p.nameUz;
  const getEffectivePrice = (p: Product) => (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
  const total = cartRows.reduce((sum, row) => sum + getEffectivePrice(row.product || { id: 0, nameUz: "", nameEn: "", nameRu: "", price: 0, category: "" }) * row.quantity, 0);
  const itemCount = cartRows.reduce((sum, row) => sum + row.quantity, 0);

  const handleOrder = () => {
    if (!form.fullName || !form.phone || !form.deliveryAddress) {
      toast({ title: lang === "uz" ? "Barcha maydonlarni to'ldiring" : lang === "ru" ? "Заполните все поля" : "Fill all fields", variant: "destructive" });
      return;
    }
    const items: OrderItem[] = cartRows.filter((r) => r.product).map((r) => ({
      productId: r.product!.id, productName: getProductName(r.product!),
      price: getEffectivePrice(r.product!), quantity: r.quantity,
    }));
    placeOrder.mutate({ ...form, items, total });
  };

  const handlePayRedirect = async (orderId: number) => {
    setRedirectLoading(true);
    try {
      const data = await api.get<{ url: string }>(`/payments/checkout-url/${orderId}`);
      window.location.href = data.url;
    } catch {
      toast({ title: lang === "uz" ? "To'lov tizimi sozlanmagan" : lang === "ru" ? "Платёжная система не настроена" : "Payment not configured", variant: "destructive" });
      setRedirectLoading(false);
    }
  };

  const isPaymentRedirect = orderSuccess && (orderSuccess.paymentMethod === "payme" || orderSuccess.paymentMethod === "click");
  const selectedPm = PAYMENT_METHODS.find((p) => p.value === form.paymentMethod);

  const t = {
    uz: { title: "Mening savatim", empty: "Savat bo'sh", emptyDesc: "Hali hech narsa qo'shilmagan", toCatalog: "Katalogga o'tish", total: "Jami summa", order: "Buyurtma rasmiylashtirish", back: "Savatga qaytish", fullName: "To'liq ism", phone: "Telefon raqam", address: "Yetkazib berish manzili", payment: "To'lov usuli", confirm: "Tasdiqlash", successTitle: "Buyurtma qabul qilindi!", successDesc: (id: number) => `Buyurtma №${id} muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.`, payNow: (pm: string) => `${pm} orqali to'lash`, payLater: "Keyinroq to'layman", payInfo: "To'lov sahifasiga yo'naltirilasiz", close: "Yopish", items: (n: number) => `${n} ta mahsulot`, som: "so'm" },
    ru: { title: "Моя корзина", empty: "Корзина пуста", emptyDesc: "Добавьте товары из каталога", toCatalog: "Перейти в каталог", total: "Итого", order: "Оформить заказ", back: "Назад в корзину", fullName: "Полное имя", phone: "Номер телефона", address: "Адрес доставки", payment: "Способ оплаты", confirm: "Подтвердить заказ", successTitle: "Заказ принят!", successDesc: (id: number) => `Заказ №${id} оформлен. Мы свяжемся с вами в ближайшее время.`, payNow: (pm: string) => `Оплатить через ${pm}`, payLater: "Оплачу позже", payInfo: "Вы будете перенаправлены на страницу оплаты", close: "Закрыть", items: (n: number) => `${n} товаров`, som: "сум" },
    en: { title: "My Cart", empty: "Your cart is empty", emptyDesc: "Add products from the catalog", toCatalog: "Go to catalog", total: "Total", order: "Place Order", back: "Back to cart", fullName: "Full name", phone: "Phone number", address: "Delivery address", payment: "Payment method", confirm: "Confirm order", successTitle: "Order placed!", successDesc: (id: number) => `Order #${id} placed successfully. We'll contact you soon.`, payNow: (pm: string) => `Pay with ${pm}`, payLater: "Pay later", payInfo: "You will be redirected to the payment page", close: "Close", items: (n: number) => `${n} items`, som: "UZS" },
  }[lang as "uz" | "ru" | "en"] ?? { title: "Cart", empty: "Cart is empty", emptyDesc: "Add products", toCatalog: "Catalog", total: "Total", order: "Order", back: "Back", fullName: "Name", phone: "Phone", address: "Address", payment: "Payment", confirm: "Confirm", successTitle: "Done!", successDesc: (id: number) => `Order #${id}`, payNow: (pm: string) => `Pay ${pm}`, payLater: "Later", payInfo: "Redirect", close: "Close", items: (n: number) => `${n}`, som: "UZS" };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[200]"
            onClick={onClose}
          />

          {/* Drawer */}
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
                    <ShoppingCart size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base leading-none">{t.title}</h2>
                    {cartRows.length > 0 && (
                      <p className="text-blue-200 text-xs mt-0.5">{t.items(itemCount)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              {!orderSuccess && !checkout && cartRows.length > 0 && (
                <div className="bg-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between">
                  <span className="text-white/80 text-xs font-medium">{t.total}</span>
                  <span className="text-white font-bold text-sm">{total.toLocaleString()} {t.som}</span>
                </div>
              )}
            </div>

            {/* ── SUCCESS STATE ── */}
            {orderSuccess !== null ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200"
                >
                  <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[260px] mx-auto">
                    {t.successDesc(orderSuccess.id)}
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full space-y-3">
                  {isPaymentRedirect ? (
                    <>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
                        <CreditCard size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-blue-800 mb-0.5">{t.payInfo}</p>
                          <p className="text-xs text-blue-600">{orderSuccess.paymentMethod === "payme" ? "Payme" : "Click"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePayRedirect(orderSuccess.id)}
                        disabled={redirectLoading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-60 transition-all"
                      >
                        {redirectLoading ? <span className="animate-pulse text-sm">...</span> : <><ExternalLink size={16} />{t.payNow(orderSuccess.paymentMethod === "payme" ? "Payme" : "Click")}</>}
                      </button>
                      <button onClick={() => { setOrderSuccess(null); setCheckout(false); onClose(); }} className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        {t.payLater}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2.5">
                        <a href="tel:+998905783272" className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-[#0f3460] text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors">
                          <Phone size={14} />
                          {lang === "uz" ? "Qo'ng'iroq" : lang === "ru" ? "Позвонить" : "Call"}
                        </a>
                        <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors">
                          <Send size={14} />Telegram
                        </a>
                      </div>
                      <button onClick={() => { setOrderSuccess(null); setCheckout(false); onClose(); }} className="w-full py-2.5 text-sm text-gray-400 underline hover:text-gray-600 transition-colors">
                        {t.close}
                      </button>
                    </>
                  )}
                </motion.div>
              </div>

            ) : checkout ? (
              /* ── CHECKOUT FORM ── */
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
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-600">{t.total}</span>
                      <span className="font-bold text-base text-[#0f3460]">{total.toLocaleString()} {t.som}</span>
                    </div>
                  </div>

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

                  {/* Payment method */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">{t.payment}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <button
                          key={pm.value}
                          onClick={() => setForm({ ...form, paymentMethod: pm.value })}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                            form.paymentMethod === pm.value
                              ? "bg-[#0f3460] text-white border-[#0f3460] shadow-md shadow-blue-100"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <span className="text-sm">{pm.icon}</span>
                          <span>{lang === "ru" ? pm.ru : lang === "en" ? pm.en : pm.uz}</span>
                        </button>
                      ))}
                    </div>
                    {selectedPm?.redirect && (
                      <div className="mt-2 flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <CreditCard size={13} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 leading-snug">
                          {lang === "uz"
                            ? `Tasdiqlashdan so'ng ${selectedPm.uz} sahifasiga yo'naltirilasiz`
                            : lang === "ru"
                            ? `После подтверждения вы будете перенаправлены на ${selectedPm.ru}`
                            : `After confirmation you'll be redirected to ${selectedPm.en}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={handleOrder}
                    disabled={placeOrder.isPending}
                    className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                  >
                    {placeOrder.isPending ? (
                      <span className="animate-pulse">{lang === "uz" ? "Yuborilmoqda..." : lang === "ru" ? "Отправка..." : "Sending..."}</span>
                    ) : selectedPm?.redirect ? (
                      <><ExternalLink size={15} />{lang === "uz" ? "To'lovga o'tish" : lang === "ru" ? "Перейти к оплате" : "Proceed to payment"}</>
                    ) : (
                      <><CheckCircle2 size={16} />{t.confirm}</>
                    )}
                  </button>
                </div>
              </div>

            ) : (
              /* ── CART ITEMS ── */
              <div className="flex-1 flex flex-col overflow-hidden">
                {cartRows.length === 0 ? (
                  /* Empty state */
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
                        onClick={onClose}
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
                    {/* Items list */}
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
                                <img src={p.imageUrl} alt={getProductName(p)} className="w-[68px] h-[68px] rounded-xl object-cover shrink-0 border border-gray-100" />
                              ) : (
                                <div className="w-[68px] h-[68px] rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                  <Package size={22} className="text-gray-300" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                                  {getProductName(p)}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-[#0f3460]">
                                    {(effectivePrice * row.quantity).toLocaleString()} {t.som}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through">
                                      {(p.price * row.quantity).toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                  {/* Qty controls */}
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
                                  {/* Unit price */}
                                  <span className="text-xs text-gray-400">{effectivePrice.toLocaleString()} × {row.quantity}</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
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
