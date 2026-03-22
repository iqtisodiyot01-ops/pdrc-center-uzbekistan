import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/use-store";
import { api } from "@/lib/api";
import {
  User, ShoppingBag, Heart, ShoppingCart, LogOut,
  Package, ArrowUpDown, Trash2, ChevronRight,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  price: number; imageUrl?: string | null; category: string;
}
interface CartRow { id: number; quantity: number; product: Product | null; }
interface WishRow { id: number; createdAt: string; product: Product | null; }
interface Order {
  id: number; total: number; status: string; paymentMethod: string;
  deliveryAddress: string; createdAt: string; items: unknown;
}

type SortKey = "price" | "name" | "date";

export default function Profile() {
  const { lang, user, logout, token } = useAppStore();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [wishSort, setWishSort] = useState<SortKey>("date");
  const [cartSort, setCartSort] = useState<SortKey>("name");
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "wishlist" | "cart">("overview");

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
      logout: "Chiqish",
      noOrders: "Buyurtmalar yo'q",
      noWishlist: "Saqlangan mahsulotlar yo'q",
      noCart: "Savat bo'sh",
      sort: "Saralash",
      byPrice: "Narx bo'yicha",
      byName: "Nomi bo'yicha",
      byDate: "Sana bo'yicha",
      total: "Jami",
      som: "so'm",
      status: { pending: "Kutilmoqda", confirmed: "Tasdiqlangan", delivered: "Yetkazildi", cancelled: "Bekor qilindi" },
    },
    ru: {
      profile: "Профиль",
      orders: "Заказы",
      wishlist: "Сохранённые",
      cart: "Корзина",
      logout: "Выйти",
      noOrders: "Заказов нет",
      noWishlist: "Нет сохранённых товаров",
      noCart: "Корзина пуста",
      sort: "Сортировка",
      byPrice: "По цене",
      byName: "По названию",
      byDate: "По дате",
      total: "Итого",
      som: "сум",
      status: { pending: "В ожидании", confirmed: "Подтверждён", delivered: "Доставлен", cancelled: "Отменён" },
    },
    en: {
      profile: "Profile",
      orders: "Orders",
      wishlist: "Saved",
      cart: "Cart",
      logout: "Logout",
      noOrders: "No orders yet",
      noWishlist: "No saved products",
      noCart: "Cart is empty",
      sort: "Sort",
      byPrice: "By price",
      byName: "By name",
      byDate: "By date",
      total: "Total",
      som: "UZS",
      status: { pending: "Pending", confirmed: "Confirmed", delivered: "Delivered", cancelled: "Cancelled" },
    },
  }[lang] ?? {
    profile: "Profile", orders: "Orders", wishlist: "Saved", cart: "Cart", logout: "Logout",
    noOrders: "No orders", noWishlist: "No saved", noCart: "Empty", sort: "Sort",
    byPrice: "By price", byName: "By name", byDate: "By date", total: "Total", som: "UZS",
    status: { pending: "Pending", confirmed: "Confirmed", delivered: "Delivered", cancelled: "Cancelled" },
  };

  const statusColor = (s: string) => ({
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }[s] || "bg-gray-100 text-gray-700");

  const tabs = [
    { key: "overview", label: t.profile, icon: User },
    { key: "orders", label: t.orders, icon: ShoppingBag, badge: orders.length },
    { key: "wishlist", label: t.wishlist, icon: Heart, badge: wishRows.length },
    { key: "cart", label: t.cart, icon: ShoppingCart, badge: cartRows.length },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#0f3460] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/30 border-2 border-blue-400 flex items-center justify-center shrink-0">
              <User size={28} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-heading font-bold text-white leading-tight truncate">
                {user?.name || "—"}
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

      {/* Stats bar */}
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

      {/* Tabs */}
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

        {/* Tab content */}
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
              ) : orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-gray-900">#{order.id}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ")}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>
                      {t.status[order.status as keyof typeof t.status] || order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 truncate">📍 {order.deliveryAddress}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {lang === "uz" ? "To'lov" : lang === "ru" ? "Оплата" : "Payment"}: {order.paymentMethod}
                    </span>
                    <span className="font-bold text-[#0f3460]">{order.total.toLocaleString()} {t.som}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              {wishRows.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{wishRows.length} {lang === "uz" ? "ta" : lang === "ru" ? "шт" : "items"}</span>
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
                  <span className="text-sm text-gray-500">{cartRows.length} {lang === "uz" ? "ta" : lang === "ru" ? "шт" : "items"}</span>
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
                            <p className="text-xs text-gray-400">{p.price.toLocaleString()} × {row.quantity}</p>
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

        </div>
      </div>
    </div>
  );
}
