import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/use-store";
import { api } from "@/lib/api";
import {
  User, ShoppingBag, Heart, ShoppingCart, LogOut,
  Package, ArrowUpDown, Trash2, ChevronRight, ChevronDown,
  Clock, CheckCircle2, Box, Truck, MapPin, MessageCircle, Send,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  price: number; imageUrl?: string | null; category: string;
}
interface CartRow { id: number; quantity: number; product: Product | null; }
interface WishRow { id: number; createdAt: string; product: Product | null; }
interface OrderItem {
  productId: number; productName: string; price: number; quantity: number;
}
interface Order {
  id: number; total: number; status: string; paymentMethod: string;
  deliveryAddress: string; createdAt: string; items: OrderItem[] | unknown;
}

interface Message {
  id: number;
  subject: string | null;
  message: string;
  reply: string | null;
  isRead: boolean;
  createdAt: string;
}

type SortKey = "price" | "name" | "date";

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "shipped", "delivered"] as const;

function OrderTimeline({ status, lang }: { status: string; lang: string }) {
  const statusLabels: Record<string, Record<string, string>> = {
    pending: { uz: "Kutilmoqda", ru: "\u0412 \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u0438", en: "Pending" },
    confirmed: { uz: "Tasdiqlangan", ru: "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d", en: "Confirmed" },
    preparing: { uz: "Tayyorlanmoqda", ru: "\u0413\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f", en: "Preparing" },
    shipped: { uz: "Yetkazilmoqda", ru: "\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f", en: "Shipped" },
    delivered: { uz: "Yetkazildi", ru: "\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d", en: "Delivered" },
  };
  const statusIcons = [Clock, CheckCircle2, Box, Truck, MapPin];

  const currentIndex = ORDER_STATUSES.indexOf(status as typeof ORDER_STATUSES[number]);

  return (
    <div className="flex items-center w-full mt-3 mb-1">
      {ORDER_STATUSES.map((s, i) => {
        const Icon = statusIcons[i];
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isCurrent
                  ? "bg-blue-700 text-white ring-4 ring-blue-100"
                  : isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}>
                <Icon size={14} />
              </div>
              <span className={`text-[10px] mt-1 font-medium text-center leading-tight whitespace-nowrap ${
                isCurrent ? "text-blue-700 font-bold" : isCompleted ? "text-green-600" : "text-gray-400"
              }`}>
                {statusLabels[s]?.[lang] || s}
              </span>
            </div>
            {i < ORDER_STATUSES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-14px] ${
                i < currentIndex ? "bg-green-400" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Profile() {
  const { lang, user, logout, token } = useAppStore();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [wishSort, setWishSort] = useState<SortKey>("date");
  const [cartSort, setCartSort] = useState<SortKey>("name");
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "wishlist" | "cart" | "messages">("overview");
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const { data: cartRows = [] } = useQuery<CartRow[]>({
    queryKey: ["cart"],
    queryFn: () => api.get<CartRow[]>("/cart"),
    enabled: !!token,
  });
  const { data: wishRows = [] } = useQuery<WishRow[]>({
    queryKey: ["wishlist"],
    queryFn: () => api.get<WishRow[]>("/wishlist"),
    enabled: !!token,
  });
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => api.get<Order[]>("/orders"),
    enabled: !!token,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["my-messages"],
    queryFn: () => api.get<Message[]>("/my-messages"),
    enabled: !!token,
    refetchInterval: activeTab === "messages" ? 15000 : false,
  });

  const sendMessage = useMutation({
    mutationFn: (data: { subject: string; message: string }) =>
      api.post("/my-messages", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-messages"] });
      setNewMessage("");
      setNewSubject("");
    },
  });

  useEffect(() => {
    if (activeTab === "messages") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const removeFromWishlist = useMutation({
    mutationFn: (productId: number) => api.delete(`/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
  const removeFromCart = useMutation({
    mutationFn: (id: number) => api.delete(`/cart/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const getProductName = (p: Product) =>
    lang === "ru" ? p.nameRu : lang === "en" ? p.nameEn : p.nameUz;

  const cartTotal = cartRows.reduce((s, r) => s + (r.product?.price || 0) * r.quantity, 0);

  const sortedWish = [...wishRows].sort((a, b) => {
    if (!a.product || !b.product) return 0;
    if (wishSort === "price") return b.product.price - a.product.price;
    if (wishSort === "name") return getProductName(a.product).localeCompare(getProductName(b.product));
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedCart = [...cartRows].sort((a, b) => {
    if (!a.product || !b.product) return 0;
    if (cartSort === "price") return b.product.price - a.product.price;
    return getProductName(a.product).localeCompare(getProductName(b.product));
  });

  const t = {
    uz: {
      profile: "Profil",
      orders: "Buyurtmalar",
      wishlist: "Saqlangan",
      cart: "Savat",
      messages: "Xabarlar",
      logout: "Chiqish",
      noOrders: "Buyurtmalar yo'q",
      noWishlist: "Saqlangan mahsulotlar yo'q",
      noCart: "Savat bo'sh",
      noMessages: "Xabarlar yo'q",
      sort: "Saralash",
      byPrice: "Narx bo'yicha",
      byName: "Nomi bo'yicha",
      byDate: "Sana bo'yicha",
      total: "Jami",
      som: "so'm",
      items: "ta mahsulot",
      delivery: "Yetkazib berish",
      payment: "To'lov",
      orderDetails: "Buyurtma tafsilotlari",
      subject: "Mavzu",
      messagePlaceholder: "Xabaringizni yozing...",
      send: "Yuborish",
      you: "Siz",
      admin: "Admin",
    },
    ru: {
      profile: "Профиль",
      orders: "Заказы",
      wishlist: "Сохранённые",
      cart: "Корзина",
      messages: "Сообщения",
      logout: "Выйти",
      noOrders: "Заказов нет",
      noWishlist: "Нет сохранённых товаров",
      noCart: "Корзина пуста",
      noMessages: "Нет сообщений",
      sort: "Сортировка",
      byPrice: "По цене",
      byName: "По названию",
      byDate: "По дате",
      total: "Итого",
      som: "сум",
      items: "товаров",
      delivery: "Доставка",
      payment: "Оплата",
      orderDetails: "Детали заказа",
      subject: "Тема",
      messagePlaceholder: "Напишите сообщение...",
      send: "Отправить",
      you: "Вы",
      admin: "Админ",
    },
    en: {
      profile: "Profile",
      orders: "Orders",
      wishlist: "Saved",
      cart: "Cart",
      messages: "Messages",
      logout: "Logout",
      noOrders: "No orders yet",
      noWishlist: "No saved products",
      noCart: "Cart is empty",
      noMessages: "No messages yet",
      sort: "Sort",
      byPrice: "By price",
      byName: "By name",
      byDate: "By date",
      total: "Total",
      som: "UZS",
      items: "items",
      delivery: "Delivery",
      payment: "Payment",
      orderDetails: "Order details",
      subject: "Subject",
      messagePlaceholder: "Write your message...",
      send: "Send",
      you: "You",
      admin: "Admin",
    },
  }[lang] ?? {
    profile: "Profile", orders: "Orders", wishlist: "Saved", cart: "Cart", messages: "Messages", logout: "Logout",
    noOrders: "No orders", noWishlist: "No saved", noCart: "Empty", noMessages: "No messages",
    sort: "Sort", byPrice: "By price", byName: "By name", byDate: "By date", total: "Total", som: "UZS",
    items: "items", delivery: "Delivery", payment: "Payment", orderDetails: "Order details",
    subject: "Subject", messagePlaceholder: "Write...", send: "Send", you: "You", admin: "Admin",
  };

  const statusColor = (s: string) => ({
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    preparing: "bg-purple-100 text-purple-800 border-purple-200",
    shipped: "bg-orange-100 text-orange-800 border-orange-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
  }[s] || "bg-gray-100 text-gray-700 border-gray-200");

  const statusLabel = (s: string) => {
    const labels: Record<string, Record<string, string>> = {
      pending: { uz: "Kutilmoqda", ru: "\u0412 \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u0438", en: "Pending" },
      confirmed: { uz: "Tasdiqlangan", ru: "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d", en: "Confirmed" },
      preparing: { uz: "Tayyorlanmoqda", ru: "\u0413\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f", en: "Preparing" },
      shipped: { uz: "Yetkazilmoqda", ru: "\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f", en: "Shipped" },
      delivered: { uz: "Yetkazildi", ru: "\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d", en: "Delivered" },
    };
    return labels[s]?.[lang] || s;
  };

  const paymentLabels: Record<string, string> = {
    cash: lang === "uz" ? "Naqd pul" : lang === "ru" ? "\u041d\u0430\u043b\u0438\u0447\u043d\u044b\u0435" : "Cash",
    payme: "Payme",
    click: "Click",
    card: lang === "uz" ? "Bank o'tkazmasi" : lang === "ru" ? "\u0411\u0430\u043d\u043a\u043e\u0432\u0441\u043a\u0438\u0439 \u043f\u0435\u0440\u0435\u0432\u043e\u0434" : "Bank transfer",
  };

  const tabs = [
    { key: "overview", label: t.profile, icon: User },
    { key: "orders", label: t.orders, icon: ShoppingBag, badge: orders.length },
    { key: "wishlist", label: t.wishlist, icon: Heart, badge: wishRows.length },
    { key: "cart", label: t.cart, icon: ShoppingCart, badge: cartRows.length },
    { key: "messages", label: t.messages, icon: MessageCircle, badge: messages.length },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-[#0f3460] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/30 border-2 border-blue-400 flex items-center justify-center shrink-0">
              <User size={28} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-heading font-bold text-white leading-tight truncate">
                {user?.name || "\u2014"}
              </h1>
              <p className="text-blue-200 text-sm truncate">{user?.email}</p>
              {user?.phone && <p className="text-blue-300 text-xs">{user.phone}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all shrink-0"
            >
              <LogOut size={14} />
              {t.logout}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            {[
              { label: t.orders, value: orders.length, icon: ShoppingBag },
              { label: t.wishlist, value: wishRows.length, icon: Heart },
              { label: t.cart, value: cartRows.length, icon: ShoppingCart },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center py-4 gap-1">
                <stat.icon size={18} className="text-blue-700" />
                <span className="text-xl font-bold text-[#0f3460]">{stat.value}</span>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap px-2 ${
                activeTab === tab.key
                  ? "bg-[#0f3460] text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {"badge" in tab && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.key ? "bg-white/20" : "bg-blue-100 text-blue-700"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="pb-12">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {[
                { icon: ShoppingBag, label: t.orders, value: orders.length, tab: "orders" as const },
                { icon: Heart, label: t.wishlist, value: wishRows.length, tab: "wishlist" as const },
                { icon: ShoppingCart, label: t.cart, value: `${cartRows.length} (${cartTotal.toLocaleString()} ${t.som})`, tab: "cart" as const },
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className="w-full flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-blue-700" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.value}</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                  <ShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">{t.noOrders}</p>
                </div>
              ) : orders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                const items = Array.isArray(order.items) ? order.items as OrderItem[] : [];
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">#{order.id}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(order.status)}`}>
                            {statusLabel(order.status)}
                          </span>
                          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                      <OrderTimeline status={order.status} lang={lang} />
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                        {items.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.orderDetails}</p>
                            {items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-gray-700">{item.productName} <span className="text-gray-400">\u00d7{item.quantity}</span></span>
                                <span className="font-semibold text-gray-900">{(item.price * item.quantity).toLocaleString()} {t.som}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400 font-medium mb-0.5">{t.delivery}</p>
                            <p className="text-gray-700">{order.deliveryAddress}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400 font-medium mb-0.5">{t.payment}</p>
                            <p className="text-gray-700">{paymentLabels[order.paymentMethod] || order.paymentMethod}</p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <span className="text-lg font-bold text-[#0f3460]">{t.total}: {order.total.toLocaleString()} {t.som}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              {wishRows.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{wishRows.length} {lang === "uz" ? "ta" : lang === "ru" ? "\u0448\u0442" : "items"}</span>
                  <div className="flex gap-1">
                    {(["date", "price", "name"] as SortKey[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setWishSort(s)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          wishSort === s ? "bg-blue-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                        }`}
                      >
                        <ArrowUpDown size={10} />
                        {s === "date" ? t.byDate : s === "price" ? t.byPrice : t.byName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {wishRows.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                  <Heart size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">{t.noWishlist}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedWish.map((row) => {
                    if (!row.product) return null;
                    const p = row.product;
                    return (
                      <div key={row.id} className="flex gap-3 bg-white rounded-xl border border-gray-200 p-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={getProductName(p)} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={18} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{getProductName(p)}</p>
                          <p className="text-xs font-bold text-[#0f3460] mt-1">{p.price.toLocaleString()} {t.som}</p>
                        </div>
                        <button
                          onClick={() => removeFromWishlist.mutate(p.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "cart" && (
            <div>
              {cartRows.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{cartRows.length} {lang === "uz" ? "ta" : lang === "ru" ? "\u0448\u0442" : "items"}</span>
                  <div className="flex gap-1">
                    {(["name", "price"] as SortKey[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setCartSort(s)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          cartSort === s ? "bg-blue-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                        }`}
                      >
                        <ArrowUpDown size={10} />
                        {s === "price" ? t.byPrice : t.byName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {cartRows.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                  <ShoppingCart size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">{t.noCart}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {sortedCart.map((row) => {
                      if (!row.product) return null;
                      const p = row.product;
                      return (
                        <div key={row.id} className="flex gap-3 bg-white rounded-xl border border-gray-200 p-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={getProductName(p)} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Package size={18} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{getProductName(p)}</p>
                            <p className="text-xs font-bold text-[#0f3460] mt-0.5">{(p.price * row.quantity).toLocaleString()} {t.som}</p>
                            <p className="text-xs text-gray-400">{p.price.toLocaleString()} \u00d7 {row.quantity}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart.mutate(row.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">{t.total}:</span>
                    <span className="text-lg font-bold text-[#0f3460]">{cartTotal.toLocaleString()} {t.som}</span>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === "messages" && (
            <div className="flex flex-col gap-4">
              <div className="flex-1 max-h-[500px] overflow-y-auto space-y-4 pr-1">
                {messages.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <MessageCircle size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">{t.noMessages}</p>
                  </div>
                ) : (
                  [...messages].reverse().map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-br-none px-4 py-2.5 shadow-sm bg-[#0f3460] text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase text-blue-200">{t.you}</span>
                            {msg.subject && (
                              <span className="text-[10px] text-blue-200">· {msg.subject}</span>
                            )}
                          </div>
                          <p className="text-sm leading-snug text-white">{msg.message}</p>
                          <p className="text-[10px] mt-1 text-right text-blue-200">
                            {new Date(msg.createdAt).toLocaleString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        </div>
                      </div>
                      {msg.reply && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm bg-white border border-gray-200">
                            <span className="text-[10px] font-bold uppercase text-blue-600 block mb-1">{t.admin}</span>
                            <p className="text-sm leading-snug text-gray-800">{msg.reply}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder={t.subject}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.messagePlaceholder}
                    rows={3}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey && newMessage.trim()) {
                        sendMessage.mutate({ subject: newSubject, message: newMessage });
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMessage.trim()) {
                        sendMessage.mutate({ subject: newSubject || "—", message: newMessage });
                      }
                    }}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-sm font-semibold shrink-0"
                  >
                    <Send size={14} />
                    {t.send}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
