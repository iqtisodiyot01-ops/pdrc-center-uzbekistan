import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Package, Clock, CheckCircle2, Box, Truck, MapPin, ChevronDown, Loader2, FileDown } from "lucide-react";

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "shipped", "delivered"] as const;

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: Record<string, string> }> = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: { uz: "Kutilmoqda", ru: "\u0412 \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u0438", en: "Pending" } },
  confirmed: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle2, label: { uz: "Tasdiqlangan", ru: "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d", en: "Confirmed" } },
  preparing: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Box, label: { uz: "Tayyorlanmoqda", ru: "\u0413\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f", en: "Preparing" } },
  shipped: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Truck, label: { uz: "Yetkazilmoqda", ru: "\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f", en: "Shipped" } },
  delivered: { color: "bg-green-100 text-green-800 border-green-200", icon: MapPin, label: { uz: "Yetkazildi", ru: "\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d", en: "Delivered" } },
};

interface AdminOrder {
  id: number; userId: number; userName: string | null; userEmail: string | null;
  items: { productName: string; price: number; quantity: number }[];
  total: number; fullName: string; phone: string; deliveryAddress: string;
  paymentMethod: string; status: string; paymentStatus: string; paymentId: string | null; createdAt: string;
}

export function OrdersSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ orders: AdminOrder[]; total: number; page: number; pageSize: number }>({
    queryKey: ["admin-orders", statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      return api.get(`/admin/orders?${params.toString()}`);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: lang === "uz" ? "Status yangilandi" : "Status updated" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const { token } = useAppStore();

  const handleExport = async () => {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiBase}/api/admin/export/orders`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders_${Date.now()}.xlsx`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Buyurtmalar" : lang === "ru" ? "\u0417\u0430\u043a\u0430\u0437\u044b" : "Orders"}
        </h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
          <FileDown size={16} />{lang === "uz" ? "Excel yuklab olish" : lang === "ru" ? "Скачать Excel" : "Export Excel"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <button onClick={() => { setStatusFilter(""); setPage(1); }} className={`p-3 rounded-xl border text-center transition-all bg-gray-100 text-gray-700 border-gray-200 ${statusFilter === "" ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-sm"}`}>
          <div className="text-2xl font-bold">{data?.total || 0}</div>
          <div className="text-xs font-semibold uppercase tracking-wider mt-1">{lang === "uz" ? "Barchasi" : "All"}</div>
        </button>
        {ORDER_STATUSES.map((s) => {
          const cfg = statusConfig[s];
          return (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`p-3 rounded-xl border text-center transition-all ${cfg.color} ${statusFilter === s ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-sm"}`}>
              <div className="text-2xl font-bold">-</div>
              <div className="text-xs font-semibold uppercase tracking-wider mt-1">{cfg.label[lang] || s}</div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="text-blue-700" />
            <h2 className="text-lg font-bold text-gray-900">{lang === "uz" ? "Buyurtmalar ro'yxati" : "Orders List"}</h2>
          </div>
          {data && <span className="text-sm text-gray-500">{data.total} {lang === "uz" ? "ta" : "total"}</span>}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.orders.map((order) => {
              const isExpanded = expandedId === order.id;
              const items = Array.isArray(order.items) ? order.items : [];
              const cfg = statusConfig[order.status];
              return (
                <div key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-gray-900">#{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg?.color || "bg-gray-100 text-gray-700"}`}>
                          {cfg?.label[lang] || order.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span className="text-gray-700 font-medium">{order.fullName}</span>
                        <span className="text-blue-600 font-mono text-xs">{order.phone}</span>
                        <span className="text-gray-500 truncate max-w-[200px]">{order.deliveryAddress}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-[#0f3460]">{order.total.toLocaleString()} <span className="text-xs text-gray-400">UZS</span></span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          {lang === "uz" ? "Mahsulotlar" : "Items"}
                        </p>
                        <div className="space-y-1.5">
                          {items.map((item: { productName: string; price: number; quantity: number }, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.productName} <span className="text-gray-400">{"\u00d7"}{item.quantity}</span></span>
                              <span className="font-semibold">{(item.price * item.quantity).toLocaleString()} UZS</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-semibold text-gray-700">
                          {lang === "uz" ? "Statusni o'zgartirish:" : "Change status:"}
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {ORDER_STATUSES.map((s) => {
                            const c = statusConfig[s];
                            const isCurrent = order.status === s;
                            return (
                              <button key={s} onClick={() => { if (!isCurrent) updateStatus.mutate({ id: order.id, status: s }); }}
                                disabled={isCurrent || updateStatus.isPending}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isCurrent ? `${c.color} ring-2 ring-offset-1 ring-blue-400` : `${c.color} opacity-60 hover:opacity-100`} disabled:cursor-default`}>
                                {c.label[lang] || s}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {order.userName && (
                        <div className="text-xs text-gray-400">
                          {lang === "uz" ? "Foydalanuvchi:" : "User:"} {order.userName} ({order.userEmail})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {(!data?.orders || data.orders.length === 0) && (
              <div className="p-12 text-center text-zinc-500 text-sm">{lang === "uz" ? "Buyurtmalar yo'q" : "No orders"}</div>
            )}
          </div>
        )}

        {data && data.total > data.pageSize && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50">{"\u2190"}</button>
            <span className="text-sm text-gray-600">{page} / {Math.ceil(data.total / data.pageSize)}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(data.total / data.pageSize)} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50">{"\u2192"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
