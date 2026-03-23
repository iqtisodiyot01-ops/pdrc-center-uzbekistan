import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import {
  Package, DollarSign, Users, ShoppingCart, Wrench, GraduationCap,
  MessageSquare, Megaphone, FileText, Image, Star, TrendingUp,
  TrendingDown, Clock, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import type { AdminSection } from "./AdminLayout";

interface Stats {
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  newBookings: number;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalServices: number;
  totalCourses: number;
  totalUsers: number;
  totalAdmins: number;
  totalArticles: number;
  totalGallery: number;
  totalReviews: number;
  unreadMessages: number;
  activeAds: number;
  totalIncome: number;
  totalExpense: number;
  todayOrders: number;
  thisMonthRevenue: number;
  recentOrders: Array<{ id: number; fullName: string; total: number; status: string; createdAt: string }>;
  recentBookings: Array<{ id: number; name: string; phone: string; status: string; createdAt: string }>;
  recentMessages: Array<{ id: number; name: string; subject: string; isRead: boolean; createdAt: string }>;
  lowStockProducts?: Array<{ id: number; nameUz: string; nameEn: string; nameRu: string; stock: number }>;
  dailyRevenue?: Array<{ date: string; orders_count: number; revenue: number }>;
}

interface Props {
  onNavigate: (section: AdminSection) => void;
}

export function DashboardSection({ onNavigate }: Props) {
  const { lang } = useAppStore();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<Stats>("/admin/stats"),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const t = {
    uz: {
      title: "Boshqaruv paneli",
      revenue: "Umumiy daromad",
      monthRevenue: "Bu oylik daromad",
      todayOrders: "Bugungi buyurtmalar",
      pendingOrders: "Kutilayotgan",
      totalOrders: "Jami buyurtmalar",
      products: "Mahsulotlar",
      inStock: "Mavjud",
      outOfStock: "Tugagan",
      services: "Xizmatlar",
      courses: "Kurslar",
      users: "Foydalanuvchilar",
      admins: "Adminlar",
      messages: "O'qilmagan xabarlar",
      ads: "Faol reklamalar",
      articles: "Maqolalar",
      gallery: "Galereya",
      reviews: "Sharhlar",
      income: "Kirim",
      expense: "Chiqim",
      balance: "Balans",
      recentOrders: "So'nggi buyurtmalar",
      recentMessages: "So'nggi xabarlar",
      viewAll: "Hammasini ko'rish",
      orderFlow: "Buyurtmalar oqimi",
    },
    ru: {
      title: "\u041f\u0430\u043d\u0435\u043b\u044c \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f",
      revenue: "\u041e\u0431\u0449\u0438\u0439 \u0434\u043e\u0445\u043e\u0434",
      monthRevenue: "\u0414\u043e\u0445\u043e\u0434 \u0437\u0430 \u043c\u0435\u0441\u044f\u0446",
      todayOrders: "\u0417\u0430\u043a\u0430\u0437\u044b \u0441\u0435\u0433\u043e\u0434\u043d\u044f",
      pendingOrders: "\u041e\u0436\u0438\u0434\u0430\u044e\u0442",
      totalOrders: "\u0412\u0441\u0435\u0433\u043e \u0437\u0430\u043a\u0430\u0437\u043e\u0432",
      products: "\u0422\u043e\u0432\u0430\u0440\u044b",
      inStock: "\u0412 \u043d\u0430\u043b\u0438\u0447\u0438\u0438",
      outOfStock: "\u041d\u0435\u0442 \u0432 \u043d\u0430\u043b\u0438\u0447\u0438\u0438",
      services: "\u0423\u0441\u043b\u0443\u0433\u0438",
      courses: "\u041a\u0443\u0440\u0441\u044b",
      users: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438",
      admins: "\u0410\u0434\u043c\u0438\u043d\u044b",
      messages: "\u041d\u0435\u043f\u0440\u043e\u0447\u0438\u0442\u0430\u043d\u043d\u044b\u0435",
      ads: "\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0440\u0435\u043a\u043b\u0430\u043c\u044b",
      articles: "\u0421\u0442\u0430\u0442\u044c\u0438",
      gallery: "\u0413\u0430\u043b\u0435\u0440\u0435\u044f",
      reviews: "\u041e\u0442\u0437\u044b\u0432\u044b",
      income: "\u0414\u043e\u0445\u043e\u0434",
      expense: "\u0420\u0430\u0441\u0445\u043e\u0434",
      balance: "\u0411\u0430\u043b\u0430\u043d\u0441",
      recentOrders: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u0437\u0430\u043a\u0430\u0437\u044b",
      recentMessages: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f",
      viewAll: "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0441\u0435",
      orderFlow: "\u041f\u043e\u0442\u043e\u043a \u0437\u0430\u043a\u0430\u0437\u043e\u0432",
    },
    en: {
      title: "Dashboard",
      revenue: "Total Revenue",
      monthRevenue: "This Month Revenue",
      todayOrders: "Today's Orders",
      pendingOrders: "Pending",
      totalOrders: "Total Orders",
      products: "Products",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      services: "Services",
      courses: "Courses",
      users: "Users",
      admins: "Admins",
      messages: "Unread Messages",
      ads: "Active Ads",
      articles: "Articles",
      gallery: "Gallery",
      reviews: "Reviews",
      income: "Income",
      expense: "Expense",
      balance: "Balance",
      recentOrders: "Recent Orders",
      recentMessages: "Recent Messages",
      viewAll: "View All",
      orderFlow: "Order Flow",
    },
  };
  const l = t[lang] || t.en;
  const balance = stats.totalIncome - stats.totalExpense;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{l.title}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label={l.revenue} value={`${stats.revenue.toLocaleString()} UZS`} color="bg-green-50 text-green-700" iconColor="text-green-500" onClick={() => onNavigate("finances")} />
        <StatCard icon={TrendingUp} label={l.monthRevenue} value={`${stats.thisMonthRevenue.toLocaleString()} UZS`} color="bg-blue-50 text-blue-700" iconColor="text-blue-500" />
        <StatCard icon={Package} label={l.todayOrders} value={stats.todayOrders} color="bg-purple-50 text-purple-700" iconColor="text-purple-500" onClick={() => onNavigate("orders")} />
        <StatCard icon={Clock} label={l.pendingOrders} value={stats.pendingOrders} color="bg-yellow-50 text-yellow-700" iconColor="text-yellow-500" onClick={() => onNavigate("orders")} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { status: "pending", label: lang === "uz" ? "Kutilmoqda" : "Pending", count: stats.pendingOrders, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
          { status: "confirmed", label: lang === "uz" ? "Tasdiqlangan" : "Confirmed", count: stats.confirmedOrders, color: "bg-blue-100 text-blue-800 border-blue-200" },
          { status: "preparing", label: lang === "uz" ? "Tayyorlanmoqda" : "Preparing", count: stats.preparingOrders, color: "bg-purple-100 text-purple-800 border-purple-200" },
          { status: "shipped", label: lang === "uz" ? "Yetkazilmoqda" : "Shipped", count: stats.shippedOrders, color: "bg-orange-100 text-orange-800 border-orange-200" },
          { status: "delivered", label: lang === "uz" ? "Yetkazildi" : "Delivered", count: stats.deliveredOrders, color: "bg-green-100 text-green-800 border-green-200" },
        ].map((item) => (
          <div key={item.status} className={`p-3 rounded-xl border text-center ${item.color}`}>
            <div className="text-2xl font-bold">{item.count}</div>
            <div className="text-xs font-semibold uppercase tracking-wider mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <MiniCard icon={ShoppingCart} label={l.products} value={stats.totalProducts} sub={`${l.inStock}: ${stats.inStockProducts}`} onClick={() => onNavigate("products")} />
        <MiniCard icon={Wrench} label={l.services} value={stats.totalServices} onClick={() => onNavigate("services")} />
        <MiniCard icon={GraduationCap} label={l.courses} value={stats.totalCourses} onClick={() => onNavigate("courses")} />
        <MiniCard icon={Users} label={l.users} value={stats.totalUsers} sub={`${l.admins}: ${stats.totalAdmins}`} onClick={() => onNavigate("admins")} />
        <MiniCard icon={MessageSquare} label={l.messages} value={stats.unreadMessages} onClick={() => onNavigate("messages")} alert={stats.unreadMessages > 0} />
        <MiniCard icon={Megaphone} label={l.ads} value={stats.activeAds} onClick={() => onNavigate("advertisements")} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="font-bold text-sm text-gray-700">{l.income}</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.totalIncome.toLocaleString()} UZS</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm text-gray-700">{l.expense}</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.totalExpense.toLocaleString()} UZS</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-sm text-gray-700">{l.balance}</span>
          </div>
          <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>{balance.toLocaleString()} UZS</div>
        </div>
      </div>

      {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm text-red-700">
              {lang === "uz" ? "Omborda kam qolgan mahsulotlar" : lang === "ru" ? "Мало на складе" : "Low Stock Alert"}
            </span>
          </div>
          <div className="space-y-2">
            {stats.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                <span className="text-sm font-medium text-gray-800">
                  {lang === "uz" ? p.nameUz : lang === "ru" ? p.nameRu : p.nameEn}
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  {lang === "uz" ? `${p.stock} ta qoldi` : lang === "ru" ? `Осталось ${p.stock}` : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{l.recentOrders}</h3>
            <button onClick={() => onNavigate("orders")} className="text-xs text-blue-600 font-semibold hover:underline">{l.viewAll}</button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="p-3 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onNavigate("orders")}>
                <div>
                  <span className="font-semibold text-sm text-gray-900">#{order.id}</span>
                  <span className="text-gray-500 text-sm ml-2">{order.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-mono text-sm font-bold text-gray-700">{order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{l.recentMessages}</h3>
            <button onClick={() => onNavigate("messages")} className="text-xs text-blue-600 font-semibold hover:underline">{l.viewAll}</button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentMessages.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">{lang === "uz" ? "Xabarlar yo'q" : "No messages"}</div>
            )}
            {stats.recentMessages.map((msg) => (
              <div key={msg.id} className="p-3 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onNavigate("messages")}>
                <div className="flex items-center gap-2 min-w-0">
                  {!msg.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                  <span className="font-semibold text-sm text-gray-900">{msg.name}</span>
                  <span className="text-gray-400 text-sm truncate">{msg.subject || ""}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
        <MiniCard icon={FileText} label={l.articles} value={stats.totalArticles} onClick={() => onNavigate("articles")} />
        <MiniCard icon={Image} label={l.gallery} value={stats.totalGallery} onClick={() => onNavigate("gallery")} />
        <MiniCard icon={Star} label={l.reviews} value={stats.totalReviews} onClick={() => onNavigate("reviews")} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, iconColor, onClick }: { icon: React.ElementType; label: string; value: string | number; color: string; iconColor: string; onClick?: () => void }) {
  return (
    <div className={`rounded-xl p-4 border border-gray-100 ${color} cursor-pointer hover:shadow-md transition-all`} onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/60 ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</div>
          <div className="text-xl font-bold truncate">{value}</div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ icon: Icon, label, value, sub, onClick, alert }: { icon: React.ElementType; label: string; value: number; sub?: string; onClick?: () => void; alert?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${alert ? "border-red-200 bg-red-50" : "border-gray-200"}`} onClick={onClick}>
      <Icon size={18} className={`mb-2 ${alert ? "text-red-500" : "text-gray-400"}`} />
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    shipped: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
