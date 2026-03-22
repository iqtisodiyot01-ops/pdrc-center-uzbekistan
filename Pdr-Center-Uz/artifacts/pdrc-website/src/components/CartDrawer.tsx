import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Plus, Minus, Trash2, Phone, Send, Package, CreditCard, ExternalLink } from "lucide-react";
import { useAppStore } from "@/store/use-store";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  nameUz: string;
  nameEn: string;
  nameRu: string;
  price: number;
  imageUrl?: string | null;
  category: string;
}

interface CartRow {
  id: number;
  quantity: number;
  createdAt: string;
  product: Product | null;
}

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  { value: "cash", uz: "Naqd pul", en: "Cash", ru: "Наличные", icon: "💵" },
  { value: "payme", uz: "Payme", en: "Payme", ru: "Payme", icon: "🔵", redirect: true },
  { value: "click", uz: "Click", en: "Click", ru: "Click", icon: "🟢", redirect: true },
  { value: "card", uz: "Bank o'tkazmasi", en: "Bank transfer", ru: "Банковский перевод", icon: "🏦" },
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
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      api.put(`/cart/${id}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: (id: number) => api.delete(`/cart/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const placeOrder = useMutation({
    mutationFn: (payload: {
      fullName: string; phone: string; deliveryAddress: string;
      paymentMethod: string; items: OrderItem[]; total: number;
    }) => api.post<{ id: number }>("/orders", payload),
    onSuccess: (data) => {
      setOrderSuccess({ id: data.id, paymentMethod: form.paymentMethod });
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast({ title: lang === "uz" ? "Xatolik" : lang === "ru" ? "Ошибка" : "Error", variant: "destructive" });
    },
  });

  const total = cartRows.reduce((sum, row) => sum + (row.product?.price || 0) * row.quantity, 0);

  const getProductName = (p: Product) =>
    lang === "ru" ? p.nameRu : lang === "en" ? p.nameEn : p.nameUz;

  const handleOrder = () => {
    if (!form.fullName || !form.phone || !form.deliveryAddress) {
      toast({
        title: lang === "uz" ? "Barcha maydonlarni to'ldiring" : lang === "ru" ? "Заполните все поля" : "Fill all fields",
        variant: "destructive",
      });
      return;
    }
    const items: OrderItem[] = cartRows
      .filter((r) => r.product)
      .map((r) => ({
        productId: r.product!.id,
        productName: getProductName(r.product!),
        price: r.product!.price,
        quantity: r.quantity,
      }));
    placeOrder.mutate({ ...form, items, total });
  };

  const handlePayRedirect = async (orderId: number) => {
    setRedirectLoading(true);
    try {
      const data = await api.get<{ url: string }>(`/payments/checkout-url/${orderId}`);
      window.location.href = data.url;
    } catch {
      toast({
        title: lang === "uz" ? "To'lov tizimi sozlanmagan" : lang === "ru" ? "Платёжная система не настроена" : "Payment not configured",
        description: lang === "uz"
          ? "Administrator bilan bog'laning"
          : lang === "ru"
          ? "Свяжитесь с администратором"
          : "Please contact the administrator",
        variant: "destructive",
      });
      setRedirectLoading(false);
    }
  };

  const isPaymentRedirect = orderSuccess && (orderSuccess.paymentMethod === "payme" || orderSuccess.paymentMethod === "click");
  const selectedPm = PAYMENT_METHODS.find((p) => p.value === form.paymentMethod);

  const t = {
    uz: {
      title: "Savat",
      empty: "Savat bo'sh",
      emptyDesc: "Mahsulotlarni katalogdan qo'shing",
      total: "Jami",
      order: "Buyurtma berish",
      back: "Savatga qaytish",
      fullName: "To'liq ism",
      phone: "Telefon raqam",
      address: "Yetkazib berish manzili",
      payment: "To'lov usuli",
      confirm: "Tasdiqlash",
      successTitle: "Buyurtma qabul qilindi!",
      successDesc: (id: number) => `Buyurtma №${id} muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.`,
      payNow: (pm: string) => `${pm} orqali to'lash`,
      payLater: "Keyinroq to'layman",
      payInfo: "To'lov sahifasiga yo'naltirilasiz",
      close: "Yopish",
      som: "so'm",
      piece: "ta",
    },
    ru: {
      title: "Корзина",
      empty: "Корзина пуста",
      emptyDesc: "Добавьте товары из каталога",
      total: "Итого",
      order: "Оформить заказ",
      back: "Назад в корзину",
      fullName: "Полное имя",
      phone: "Номер телефона",
      address: "Адрес доставки",
      payment: "Способ оплаты",
      confirm: "Подтвердить",
      successTitle: "Заказ принят!",
      successDesc: (id: number) => `Заказ №${id} успешно оформлен. Мы свяжемся с вами в ближайшее время.`,
      payNow: (pm: string) => `Оплатить через ${pm}`,
      payLater: "Оплачу позже",
      payInfo: "Вы будете перенаправлены на страницу оплаты",
      close: "Закрыть",
      som: "сум",
      piece: "шт",
    },
    en: {
      title: "Cart",
      empty: "Cart is empty",
      emptyDesc: "Add products from the catalog",
      total: "Total",
      order: "Place Order",
      back: "Back to cart",
      fullName: "Full name",
      phone: "Phone number",
      address: "Delivery address",
      payment: "Payment method",
      confirm: "Confirm order",
      successTitle: "Order placed!",
      successDesc: (id: number) => `Order #${id} placed successfully. We'll contact you soon.`,
      payNow: (pm: string) => `Pay with ${pm}`,
      payLater: "Pay later",
      payInfo: "You will be redirected to the payment page",
      close: "Close",
      som: "UZS",
      piece: "pcs",
    },
  }[lang] ?? {
    title: "Cart", empty: "Cart is empty", emptyDesc: "Add products from the catalog",
    total: "Total", order: "Place Order", back: "Back to cart",
    fullName: "Full name", phone: "Phone number", address: "Delivery address",
    payment: "Payment method", confirm: "Confirm",
    successTitle: "Order placed!",
    successDesc: (id: number) => `Order #${id} placed.`,
    payNow: (pm: string) => `Pay with ${pm}`, payLater: "Pay later",
    payInfo: "You will be redirected.", close: "Close", som: "UZS", piece: "pcs",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[201] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-[#0f3460]">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-white" />
                <h2 className="font-display font-bold text-white text-base tracking-wide">{t.title}</h2>
                {cartRows.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                    {cartRows.length}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* ── SUCCESS STATE ── */}
            {orderSuccess !== null ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h3>
                <p className="text-gray-500 text-sm mb-6">{t.successDesc(orderSuccess.id)}</p>

                {isPaymentRedirect ? (
                  <div className="w-full space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={16} className="text-blue-700" />
                        <span className="text-sm font-semibold text-blue-800">{t.payInfo}</span>
                      </div>
                      <p className="text-xs text-blue-600">
                        {lang === "uz"
                          ? `${orderSuccess.paymentMethod === "payme" ? "Payme" : "Click"} to'lov tizimi orqali xavfsiz to'lov`
                          : lang === "ru"
                          ? `Безопасная оплата через ${orderSuccess.paymentMethod === "payme" ? "Payme" : "Click"}`
                          : `Secure payment via ${orderSuccess.paymentMethod === "payme" ? "Payme" : "Click"}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePayRedirect(orderSuccess.id)}
                      disabled={redirectLoading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {redirectLoading ? (
                        <span className="animate-pulse">
                          {lang === "uz" ? "Yo'naltirilmoqda..." : lang === "ru" ? "Перенаправление..." : "Redirecting..."}
                        </span>
                      ) : (
                        <>
                          <ExternalLink size={16} />
                          {t.payNow(orderSuccess.paymentMethod === "payme" ? "Payme" : "Click")}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setOrderSuccess(null); setCheckout(false); onClose(); }}
                      className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {t.payLater}
                    </button>
                    <div className="flex gap-3 pt-2">
                      <a href="tel:+998905783272"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                        <Phone size={14} />
                        {lang === "uz" ? "Qo'ng'iroq" : lang === "ru" ? "Позвонить" : "Call"}
                      </a>
                      <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                        <Send size={14} />
                        Telegram
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex gap-3">
                      <a href="tel:+998905783272"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0f3460] text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
                        <Phone size={14} />
                        +998 90 578 32 72
                      </a>
                      <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
                        <Send size={14} />
                        Telegram
                      </a>
                    </div>
                    <button
                      onClick={() => { setOrderSuccess(null); setCheckout(false); onClose(); }}
                      className="w-full py-2.5 text-sm text-gray-500 underline hover:text-gray-700 transition-colors"
                    >
                      {t.close}
                    </button>
                  </div>
                )}
              </div>
            ) : checkout ? (
              /* ── CHECKOUT FORM ── */
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <button onClick={() => setCheckout(false)} className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                    ← {t.back}
                  </button>
                </div>
                <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
                  {/* Order summary */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {cartRows.filter((r) => r.product).map((row) => (
                      <div key={row.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate flex-1 mr-2">
                          {getProductName(row.product!)} × {row.quantity}
                        </span>
                        <span className="font-semibold text-gray-900 shrink-0">
                          {(row.product!.price * row.quantity).toLocaleString()} {t.som}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                      <span>{t.total}</span>
                      <span className="text-[#0f3460]">{total.toLocaleString()} {t.som}</span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">{t.fullName}</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder={lang === "uz" ? "Ism va familiya" : lang === "ru" ? "Имя и фамилия" : "Full name"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">{t.phone}</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">{t.address}</label>
                    <textarea
                      value={form.deliveryAddress}
                      onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                      placeholder={lang === "uz" ? "Shahar, ko'cha, uy..." : lang === "ru" ? "Город, улица, дом..." : "City, street, house..."}
                    />
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{t.payment}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <button
                          key={pm.value}
                          onClick={() => setForm({ ...form, paymentMethod: pm.value })}
                          className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
                            form.paymentMethod === pm.value
                              ? "bg-blue-700 text-white border-blue-700 shadow-md"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <span className="text-base">{pm.icon}</span>
                          <span>{lang === "ru" ? pm.ru : lang === "en" ? pm.en : pm.uz}</span>
                        </button>
                      ))}
                    </div>
                    {selectedPm?.redirect && (
                      <div className="mt-2 flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                        <CreditCard size={14} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700">
                          {lang === "uz"
                            ? `Tasdiqlashdan so'ng ${selectedPm.uz} to'lov sahifasiga yo'naltirilasiz`
                            : lang === "ru"
                            ? `После подтверждения вы будете перенаправлены на страницу ${selectedPm.ru}`
                            : `After confirmation you will be redirected to ${selectedPm.en} payment page`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-gray-200">
                  <button
                    onClick={handleOrder}
                    disabled={placeOrder.isPending}
                    className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                  >
                    {placeOrder.isPending ? (
                      <span className="animate-pulse">
                        {lang === "uz" ? "Yuborilmoqda..." : lang === "ru" ? "Отправка..." : "Sending..."}
                      </span>
                    ) : selectedPm?.redirect ? (
                      <>
                        <ExternalLink size={15} />
                        {lang === "uz" ? "To'lovga o'tish" : lang === "ru" ? "Перейти к оплате" : "Proceed to payment"}
                      </>
                    ) : (
                      t.confirm
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ── CART ITEMS ── */
              <div className="flex-1 flex flex-col overflow-hidden">
                {cartRows.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <ShoppingCart size={32} className="text-gray-300" />
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-1">{t.empty}</h3>
                    <p className="text-sm text-gray-400">{t.emptyDesc}</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {cartRows.map((row) => {
                      if (!row.product) return null;
                      const p = row.product;
                      return (
                        <div key={row.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={getProductName(p)} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                              {getProductName(p)}
                            </p>
                            <p className="text-xs text-[#0f3460] font-bold mt-1">
                              {(p.price * row.quantity).toLocaleString()} {t.som}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => row.quantity > 1 ? updateQty.mutate({ id: row.id, quantity: row.quantity - 1 }) : removeItem.mutate(row.id)}
                                  className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-blue-400 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-sm font-bold">{row.quantity}</span>
                                <button
                                  onClick={() => updateQty.mutate({ id: row.id, quantity: row.quantity + 1 })}
                                  className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-blue-400 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem.mutate(row.id)}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {cartRows.length > 0 && (
                  <div className="px-5 py-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">{t.total}:</span>
                      <span className="text-lg font-bold text-[#0f3460]">{total.toLocaleString()} {t.som}</span>
                    </div>
                    <button
                      onClick={() => setCheckout(true)}
                      className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all text-sm"
                    >
                      {t.order}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
