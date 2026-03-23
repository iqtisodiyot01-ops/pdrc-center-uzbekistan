import { useState } from "react";
import { useAppStore } from "@/store/use-store";
import {
  LayoutDashboard, Package, MessageSquare, Wrench, ShoppingCart,
  GraduationCap, FileText, Users, Image, Star, Megaphone,
  DollarSign, Settings, ChevronLeft, ChevronRight, Menu, LogOut, Shield,
  Calendar, Tag, Phone, Type, ExternalLink, CreditCard, Truck, Ticket,
} from "lucide-react";

export type AdminSection =
  | "dashboard" | "orders" | "messages" | "bookings"
  | "products" | "categories" | "services" | "courses" | "articles"
  | "gallery" | "reviews" | "advertisements" | "finances"
  | "admins" | "settings" | "contactInfo" | "siteTexts" | "paymentMethods"
  | "delivery" | "promoCodes";

const PERMISSION_MAP: Record<AdminSection, string> = {
  dashboard: "dashboard",
  orders: "orders",
  messages: "messages",
  bookings: "bookings",
  products: "products",
  categories: "products",
  services: "services",
  courses: "courses",
  articles: "articles",
  gallery: "gallery",
  reviews: "reviews",
  advertisements: "advertisements",
  finances: "finances",
  admins: "admins",
  delivery: "settings",
  contactInfo: "settings",
  siteTexts: "settings",
  paymentMethods: "settings",
  settings: "settings",
  promoCodes: "products",
};

interface Props {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  unreadMessages?: number;
  pendingOrders?: number;
  children: React.ReactNode;
}

export function hasPermission(user: { role: string; permissions?: Record<string, boolean> | null } | null, section: AdminSection): boolean {
  if (!user) return false;
  if (user.role === "superadmin") return true;
  if (user.role !== "admin") return false;
  const perm = PERMISSION_MAP[section];
  if (!user.permissions) return false;
  return user.permissions[perm] === true;
}

export function AdminLayout({ activeSection, onSectionChange, unreadMessages, pendingOrders, children }: Props) {
  const { user, lang, logout } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuGroups = [
    {
      label: lang === "uz" ? "Asosiy" : lang === "ru" ? "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0435" : "Main",
      items: [
        { id: "dashboard" as AdminSection, label: lang === "uz" ? "Boshqaruv paneli" : lang === "ru" ? "\u041f\u0430\u043d\u0435\u043b\u044c" : "Dashboard", icon: LayoutDashboard },
        { id: "orders" as AdminSection, label: lang === "uz" ? "Buyurtmalar" : lang === "ru" ? "\u0417\u0430\u043a\u0430\u0437\u044b" : "Orders", icon: Package, badge: pendingOrders },
        { id: "messages" as AdminSection, label: lang === "uz" ? "Xabarlar" : lang === "ru" ? "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f" : "Messages", icon: MessageSquare, badge: unreadMessages },
        { id: "bookings" as AdminSection, label: lang === "uz" ? "Bronlar" : lang === "ru" ? "\u0411\u0440\u043e\u043d\u0438" : "Bookings", icon: Calendar },
      ],
    },
    {
      label: lang === "uz" ? "Kontent" : lang === "ru" ? "\u041a\u043e\u043d\u0442\u0435\u043d\u0442" : "Content",
      items: [
        { id: "products" as AdminSection, label: lang === "uz" ? "Mahsulotlar" : lang === "ru" ? "\u0422\u043e\u0432\u0430\u0440\u044b" : "Products", icon: ShoppingCart },
        { id: "categories" as AdminSection, label: lang === "uz" ? "Kategoriyalar" : lang === "ru" ? "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438" : "Categories", icon: Tag },
        { id: "services" as AdminSection, label: lang === "uz" ? "Xizmatlar" : lang === "ru" ? "\u0423\u0441\u043b\u0443\u0433\u0438" : "Services", icon: Wrench },
        { id: "courses" as AdminSection, label: lang === "uz" ? "Kurslar" : lang === "ru" ? "\u041a\u0443\u0440\u0441\u044b" : "Courses", icon: GraduationCap },
        { id: "articles" as AdminSection, label: lang === "uz" ? "Maqolalar" : lang === "ru" ? "\u0421\u0442\u0430\u0442\u044c\u0438" : "Articles", icon: FileText },
        { id: "gallery" as AdminSection, label: lang === "uz" ? "Galereya" : lang === "ru" ? "\u0413\u0430\u043b\u0435\u0440\u0435\u044f" : "Gallery", icon: Image },
        { id: "reviews" as AdminSection, label: lang === "uz" ? "Sharhlar" : lang === "ru" ? "\u041e\u0442\u0437\u044b\u0432\u044b" : "Reviews", icon: Star },
      ],
    },
    {
      label: lang === "uz" ? "Marketing" : lang === "ru" ? "\u041c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433" : "Marketing",
      items: [
        { id: "advertisements" as AdminSection, label: lang === "uz" ? "Reklamalar" : lang === "ru" ? "\u0420\u0435\u043a\u043b\u0430\u043c\u0430" : "Ads", icon: Megaphone },
        { id: "promoCodes" as AdminSection, label: lang === "uz" ? "Promo kodlar" : lang === "ru" ? "\u041f\u0440\u043e\u043c\u043e \u043a\u043e\u0434\u044b" : "Promo Codes", icon: Ticket },
      ],
    },
    {
      label: lang === "uz" ? "Moliya" : lang === "ru" ? "\u0424\u0438\u043d\u0430\u043d\u0441\u044b" : "Finance",
      items: [
        { id: "finances" as AdminSection, label: lang === "uz" ? "Kirim-chiqim" : lang === "ru" ? "\u0424\u0438\u043d\u0430\u043d\u0441\u044b" : "Finances", icon: DollarSign },
      ],
    },
    {
      label: lang === "uz" ? "Tizim" : lang === "ru" ? "\u0421\u0438\u0441\u0442\u0435\u043c\u0430" : "System",
      items: [
        { id: "admins" as AdminSection, label: lang === "uz" ? "Adminlar" : lang === "ru" ? "\u0410\u0434\u043c\u0438\u043d\u044b" : "Admins", icon: Shield },
        { id: "delivery" as AdminSection, label: lang === "uz" ? "Yetkazib berish" : lang === "ru" ? "Доставка" : "Delivery", icon: Truck },
        { id: "contactInfo" as AdminSection, label: lang === "uz" ? "Raqamlar & Havolalar" : lang === "ru" ? "Номера & Ссылки" : "Contacts & Links", icon: Phone },
        { id: "siteTexts" as AdminSection, label: lang === "uz" ? "Sayt matnlari" : lang === "ru" ? "Тексты сайта" : "Site Texts", icon: Type, superAdminOnly: true },
        { id: "paymentMethods" as AdminSection, label: lang === "uz" ? "To'lov usullari" : lang === "ru" ? "Способы оплаты" : "Payment Methods", icon: CreditCard, superAdminOnly: true },
        { id: "settings" as AdminSection, label: lang === "uz" ? "Sozlamalar" : lang === "ru" ? "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438" : "Settings", icon: Settings },
      ],
    },
  ];

  const sidebar = (
    <div className={`flex flex-col h-full bg-[#0a1628] text-white transition-all duration-300 ${collapsed ? "w-[68px]" : "w-[260px]"}`}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-sm uppercase tracking-wider">PDR Admin</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Go to site button */}
      <div className={`px-3 pt-3 ${collapsed ? "flex justify-center" : ""}`}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 hover:text-white transition-all border border-blue-600/30 ${collapsed ? "justify-center w-10 h-10" : "w-full"}`}
          title={lang === "uz" ? "Saytga o'tish" : lang === "ru" ? "Перейти на сайт" : "View Site"}
        >
          <ExternalLink size={14} className="shrink-0" />
          {!collapsed && <span>{lang === "uz" ? "Saytga o'tish" : lang === "ru" ? "Перейти на сайт" : "View Site"}</span>}
        </a>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {menuGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300/60">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5 px-2">
              {group.items.filter((item) => !("superAdminOnly" in item && item.superAdminOnly && user?.role !== "superadmin")).map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                const permitted = hasPermission(user, item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : permitted
                          ? "text-gray-300 hover:bg-white/5 hover:text-white"
                          : "text-gray-500 hover:bg-white/5"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {("badge" in item) && item.badge && (item.badge as number) > 0 ? (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {item.badge as number}
                          </span>
                        ) : null}
                        {!permitted && (
                          <span className="text-[10px] text-yellow-500/70">
                            <Shield size={12} />
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-[10px] text-blue-300/60 uppercase tracking-wider">{user?.role}</div>
            </div>
          </div>
        )}
        <button onClick={() => { logout(); window.location.href = "/login"; }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          {!collapsed && <span>{lang === "uz" ? "Chiqish" : lang === "ru" ? "\u0412\u044b\u0445\u043e\u0434" : "Logout"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      <div className="hidden lg:flex">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm uppercase tracking-wider text-[#0f3460]">PDR Admin</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
