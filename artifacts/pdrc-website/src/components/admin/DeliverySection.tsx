import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Edit, Loader2, Save, X, Truck, Package, MapPin,
  Globe, Send, CreditCard, Banknote, Wallet, Building, Phone, ChevronDown,
} from "lucide-react";

/* ─── Icon registry ─── */
const ZONE_ICONS = ["MapPin", "Truck", "Package", "Globe", "Send", "Box", "Plane", "Ship"] as const;
const PAYMENT_ICONS = ["CreditCard", "Banknote", "Wallet", "Building", "Phone", "QrCode", "Landmark"] as const;

const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Truck, Package, Globe, Send, CreditCard, Banknote, Wallet, Building, Phone,
  Box: Package, Plane: Send, Ship: Truck, QrCode: CreditCard, Landmark: Building,
};

const COLORS = [
  { key: "green", label: "Yashil", bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700" },
  { key: "blue",  label: "Ko'k",   bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-700",  badge: "bg-blue-100 text-blue-700" },
  { key: "purple",label: "Binafsha",bg: "bg-purple-50",border: "border-purple-200",text: "text-purple-700",badge: "bg-purple-100 text-purple-700" },
  { key: "orange",label: "To'q sariq",bg: "bg-orange-50",border: "border-orange-200",text: "text-orange-700",badge: "bg-orange-100 text-orange-700" },
  { key: "red",   label: "Qizil",  bg: "bg-red-50",   border: "border-red-200",   text: "text-red-700",   badge: "bg-red-100 text-red-700" },
  { key: "teal",  label: "Moviy",  bg: "bg-teal-50",  border: "border-teal-200",  text: "text-teal-700",  badge: "bg-teal-100 text-teal-700" },
];

function getColor(key: string) { return COLORS.find(c => c.key === key) ?? COLORS[1]; }

const inp = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200";
const label = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

/* ─── Types ─── */
interface Zone {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  icon: string; color: string; price: number; estimatedTime: string;
  priceTextUz: string; priceTextEn: string; priceTextRu: string;
  priceSubtextUz: string; priceSubtextEn: string; priceSubtextRu: string;
  isActive: boolean; sortOrder: number;
}
interface PagePayment {
  id: number; icon: string;
  titleUz: string; titleEn: string; titleRu: string;
  descUz: string; descEn: string; descRu: string;
  isActive: boolean; sortOrder: number;
}

const ZONE_DEFAULT: Omit<Zone, "id"> = {
  nameUz: "", nameEn: "", nameRu: "", icon: "Truck", color: "blue",
  price: 0, estimatedTime: "", priceTextUz: "", priceTextEn: "", priceTextRu: "",
  priceSubtextUz: "", priceSubtextEn: "", priceSubtextRu: "", isActive: true, sortOrder: 0,
};
const PAYMENT_DEFAULT: Omit<PagePayment, "id"> = {
  icon: "CreditCard", titleUz: "", titleEn: "", titleRu: "",
  descUz: "", descEn: "", descRu: "", isActive: true, sortOrder: 0,
};

/* ═══════════════════════════════════════════════════════════
   ZONE FORM
═══════════════════════════════════════════════════════════ */
function ZoneForm({ zone, onSave, onCancel, loading }: {
  zone: Omit<Zone, "id"> & { id?: number };
  onSave: (data: Omit<Zone, "id">) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({ ...ZONE_DEFAULT, ...zone });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const color = getColor(form.color);
  const IconComp = ICON_MAP[form.icon] ?? Truck;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
      {/* Preview */}
      <div className={`rounded-xl border p-4 ${color.bg} ${color.border}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${color.badge}`}>
          <IconComp size={18} />
        </div>
        <div className={`text-sm font-bold ${color.text}`}>{form.nameUz || "Zona nomi"}</div>
        <div className="text-xs text-gray-500 mt-1">{form.estimatedTime || "Muddat"}</div>
        <div className="text-xs text-gray-700 font-semibold mt-0.5">{form.priceTextUz || "Narx matni"}</div>
        <div className="text-xs text-gray-400">{form.priceSubtextUz || "Qo'shimcha ma'lumot"}</div>
      </div>

      {/* Icon & Color */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Ikonka</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {ZONE_ICONS.map(ic => {
              const Ic = ICON_MAP[ic] ?? Truck;
              return (
                <button key={ic} type="button" onClick={() => set("icon", ic)}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all ${form.icon === ic ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                  title={ic}>
                  <Ic size={16} />
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className={label}>Rang sxemasi</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {COLORS.map(c => (
              <button key={c.key} type="button" onClick={() => set("color", c.key)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${c.bg} ${form.color === c.key ? "border-gray-700 scale-110" : "border-transparent hover:border-gray-300"}`}
                title={c.label} />
            ))}
          </div>
        </div>
      </div>

      {/* Names */}
      <div>
        <p className={label}>Zona nomi</p>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] text-gray-400 font-medium">UZ</label><input className={inp} value={form.nameUz} onChange={e => set("nameUz", e.target.value)} placeholder="Toshkent shahri" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">EN</label><input className={inp} value={form.nameEn} onChange={e => set("nameEn", e.target.value)} placeholder="Tashkent City" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">RU</label><input className={inp} value={form.nameRu} onChange={e => set("nameRu", e.target.value)} placeholder="Ташкент" /></div>
        </div>
      </div>

      {/* Time & Price */}
      <div className="grid grid-cols-2 gap-3">
        <div><label className={label}>Yetkazish muddati</label><input className={inp} value={form.estimatedTime} onChange={e => set("estimatedTime", e.target.value)} placeholder="1–2 ish kuni" /></div>
        <div><label className={label}>Asosiy narx (UZS) — CartDrawer uchun</label><input type="number" className={inp} value={form.price} onChange={e => set("price", Number(e.target.value))} /></div>
      </div>

      {/* Price Text */}
      <div>
        <p className={label}>Narx matni (sahifada ko'rsatiladigan)</p>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] text-gray-400 font-medium">UZ</label><input className={inp} value={form.priceTextUz} onChange={e => set("priceTextUz", e.target.value)} placeholder="Bepul (500 000+ buyurtma)" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">EN</label><input className={inp} value={form.priceTextEn} onChange={e => set("priceTextEn", e.target.value)} placeholder="Free (orders 500 000+)" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">RU</label><input className={inp} value={form.priceTextRu} onChange={e => set("priceTextRu", e.target.value)} placeholder="Бесплатно (от 500 000)" /></div>
        </div>
      </div>

      {/* Price Subtext */}
      <div>
        <p className={label}>Narx qo'shimcha matni</p>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] text-gray-400 font-medium">UZ</label><input className={inp} value={form.priceSubtextUz} onChange={e => set("priceSubtextUz", e.target.value)} placeholder="30 000 UZS (kichik buyurtma)" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">EN</label><input className={inp} value={form.priceSubtextEn} onChange={e => set("priceSubtextEn", e.target.value)} placeholder="30 000 UZS (small order)" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">RU</label><input className={inp} value={form.priceSubtextRu} onChange={e => set("priceSubtextRu", e.target.value)} placeholder="30 000 UZS (малый заказ)" /></div>
        </div>
      </div>

      {/* Sort & Active */}
      <div className="flex items-center gap-4">
        <div className="w-32"><label className={label}>Tartib #</label><input type="number" className={inp} value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} /></div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} />
          <span className="text-sm text-gray-700">Faol</span>
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60 text-sm font-semibold transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Saqlash
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <X size={14} className="inline mr-1" />Bekor qilish
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAYMENT FORM
═══════════════════════════════════════════════════════════ */
function PaymentForm({ payment, onSave, onCancel, loading }: {
  payment: Omit<PagePayment, "id"> & { id?: number };
  onSave: (data: Omit<PagePayment, "id">) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({ ...PAYMENT_DEFAULT, ...payment });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const IconComp = ICON_MAP[form.icon] ?? CreditCard;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
      {/* Preview */}
      <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 shrink-0">
          <IconComp size={18} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">{form.titleUz || "To'lov nomi"}</div>
          <div className="text-xs text-gray-500 mt-0.5">{form.descUz || "Tavsif"}</div>
        </div>
      </div>

      {/* Icon */}
      <div>
        <label className={label}>Ikonka</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PAYMENT_ICONS.map(ic => {
            const Ic = ICON_MAP[ic] ?? CreditCard;
            return (
              <button key={ic} type="button" onClick={() => set("icon", ic)}
                className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all ${form.icon === ic ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                title={ic}>
                <Ic size={16} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Titles */}
      <div>
        <p className={label}>Nomi</p>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] text-gray-400 font-medium">UZ</label><input className={inp} value={form.titleUz} onChange={e => set("titleUz", e.target.value)} placeholder="Naqd pul" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">EN</label><input className={inp} value={form.titleEn} onChange={e => set("titleEn", e.target.value)} placeholder="Cash" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">RU</label><input className={inp} value={form.titleRu} onChange={e => set("titleRu", e.target.value)} placeholder="Наличные" /></div>
        </div>
      </div>

      {/* Descriptions */}
      <div>
        <p className={label}>Tavsif</p>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] text-gray-400 font-medium">UZ</label><input className={inp} value={form.descUz} onChange={e => set("descUz", e.target.value)} placeholder="Yetkazib berilganda naqd to'lov" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">EN</label><input className={inp} value={form.descEn} onChange={e => set("descEn", e.target.value)} placeholder="Cash on delivery" /></div>
          <div><label className="text-[10px] text-gray-400 font-medium">RU</label><input className={inp} value={form.descRu} onChange={e => set("descRu", e.target.value)} placeholder="Оплата при получении" /></div>
        </div>
      </div>

      {/* Sort & Active */}
      <div className="flex items-center gap-4">
        <div className="w-32"><label className={label}>Tartib #</label><input type="number" className={inp} value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} /></div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} />
          <span className="text-sm text-gray-700">Faol</span>
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60 text-sm font-semibold transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Saqlash
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <X size={14} className="inline mr-1" />Bekor qilish
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN SECTION
═══════════════════════════════════════════════════════════ */
export default function DeliverySection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"zones" | "payments">("zones");

  /* Zones state */
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [expandedZone, setExpandedZone] = useState<number | null>(null);

  /* Payments state */
  const [showPayForm, setShowPayForm] = useState(false);
  const [editPay, setEditPay] = useState<PagePayment | null>(null);
  const [expandedPay, setExpandedPay] = useState<number | null>(null);

  /* ── Queries ── */
  const { data: zones = [], isLoading: zonesLoading } = useQuery<Zone[]>({
    queryKey: ["admin-delivery-zones"],
    queryFn: () => api.get<Zone[]>("/admin/delivery-zones"),
  });

  const { data: pagePayments = [], isLoading: paysLoading } = useQuery<PagePayment[]>({
    queryKey: ["admin-delivery-page-payments"],
    queryFn: () => api.get<PagePayment[]>("/admin/delivery-page-payments"),
  });

  /* ── Zone mutations ── */
  const createZone = useMutation({
    mutationFn: (d: Omit<Zone, "id">) => api.post("/admin/delivery-zones", d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-zones"] }); qc.invalidateQueries({ queryKey: ["delivery-zones"] }); setShowZoneForm(false); toast({ title: "Zona qo'shildi" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Xatolik", description: err.message }),
  });
  const updateZone = useMutation({
    mutationFn: ({ id, ...d }: Zone) => api.put(`/admin/delivery-zones/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-zones"] }); qc.invalidateQueries({ queryKey: ["delivery-zones"] }); setEditZone(null); toast({ title: "Yangilandi" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Xatolik", description: err.message }),
  });
  const deleteZone = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/delivery-zones/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-zones"] }); qc.invalidateQueries({ queryKey: ["delivery-zones"] }); toast({ title: "O'chirildi" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Xatolik", description: err.message }),
  });

  /* ── Payment mutations ── */
  const createPay = useMutation({
    mutationFn: (d: Omit<PagePayment, "id">) => api.post("/admin/delivery-page-payments", d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-page-payments"] }); qc.invalidateQueries({ queryKey: ["delivery-page-payments"] }); setShowPayForm(false); toast({ title: "To'lov usuli qo'shildi" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Xatolik", description: err.message }),
  });
  const updatePay = useMutation({
    mutationFn: ({ id, ...d }: PagePayment) => api.put(`/admin/delivery-page-payments/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-page-payments"] }); qc.invalidateQueries({ queryKey: ["delivery-page-payments"] }); setEditPay(null); toast({ title: "Yangilandi" }); },
    onError: (err: Error) => toast({ variant: "destructive", title: "Xatolik", description: err.message }),
  });
  const deletePay = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/delivery-page-payments/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-page-payments"] }); qc.invalidateQueries({ queryKey: ["delivery-page-payments"] }); toast({ title: "O'chirildi" }); },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {lang === "uz" ? "Yetkazib berish boshqaruvi" : lang === "ru" ? "Управление доставкой" : "Delivery Management"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lang === "uz" ? "Yetkazib berish sahifasidagi barcha ma'lumotlarni boshqaring" : "Manage all content on the delivery page"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("zones")}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "zones" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Truck size={14} className="inline mr-1.5" />
          {lang === "uz" ? "Yetkazish zonalari" : lang === "ru" ? "Зоны доставки" : "Delivery Zones"}
          <span className="ml-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{zones.length}</span>
        </button>
        <button onClick={() => setTab("payments")}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "payments" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <CreditCard size={14} className="inline mr-1.5" />
          {lang === "uz" ? "To'lov usullari" : lang === "ru" ? "Способы оплаты" : "Payment Methods"}
          <span className="ml-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pagePayments.length}</span>
        </button>
      </div>

      {/* ══════ ZONES TAB ══════ */}
      {tab === "zones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{lang === "uz" ? "Yetkazish zonalarini qo'shing va tahrirlang" : "Add and edit delivery zones"}</p>
            <button onClick={() => { setShowZoneForm(true); setEditZone(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 text-sm font-semibold transition-colors">
              <Plus size={14} /> {lang === "uz" ? "Zona qo'shish" : "Add Zone"}
            </button>
          </div>

          {showZoneForm && !editZone && (
            <ZoneForm
              zone={ZONE_DEFAULT}
              onSave={(d) => createZone.mutate(d)}
              onCancel={() => setShowZoneForm(false)}
              loading={createZone.isPending}
            />
          )}

          {zonesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : zones.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Hali zona yo'q. Birinchi zonani qo'shing.</div>
          ) : (
            <div className="space-y-3">
              {zones.map(z => {
                const c = getColor(z.color);
                const Ic = ICON_MAP[z.icon] ?? Truck;
                const isEditing = editZone?.id === z.id;
                const isExpanded = expandedZone === z.id;
                return (
                  <div key={z.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                    {/* Row */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.badge} shrink-0`}>
                        <Ic size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold ${c.text} truncate`}>{z.nameUz}</div>
                        <div className="text-xs text-gray-400">{z.estimatedTime} · {z.priceTextUz || `${z.price.toLocaleString()} UZS`}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${z.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {z.isActive ? "Faol" : "Nofaol"}
                        </span>
                        <button onClick={() => { setEditZone(z); setShowZoneForm(false); setExpandedZone(z.id); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit size={14} /></button>
                        <button onClick={() => { if (confirm("O'chirilsinmi?")) deleteZone.mutate(z.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                        <button onClick={() => setExpandedZone(isExpanded ? null : z.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                          <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expand / Edit */}
                    {(isEditing || isExpanded) && (
                      <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                        {isEditing ? (
                          <ZoneForm
                            zone={z}
                            onSave={(d) => updateZone.mutate({ ...d, id: z.id })}
                            onCancel={() => setEditZone(null)}
                            loading={updateZone.isPending}
                          />
                        ) : (
                          <div className="grid grid-cols-2 gap-3 py-2 text-xs text-gray-600">
                            <div><span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">EN: </span>{z.nameEn}</div>
                            <div><span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">RU: </span>{z.nameRu}</div>
                            <div><span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Narx matni UZ: </span>{z.priceTextUz}</div>
                            <div><span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Qo'sh.matn UZ: </span>{z.priceSubtextUz}</div>
                            <div><span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Cart narxi: </span>{z.price.toLocaleString()} UZS</div>
                            <div><span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Tartib: </span>#{z.sortOrder}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════ PAYMENTS TAB ══════ */}
      {tab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{lang === "uz" ? "Delivery sahifasidagi to'lov usullari kartalarini boshqaring" : "Manage payment method cards on the delivery page"}</p>
            <button onClick={() => { setShowPayForm(true); setEditPay(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 text-sm font-semibold transition-colors">
              <Plus size={14} /> {lang === "uz" ? "Usul qo'shish" : "Add Method"}
            </button>
          </div>

          {showPayForm && !editPay && (
            <PaymentForm
              payment={PAYMENT_DEFAULT}
              onSave={(d) => createPay.mutate(d)}
              onCancel={() => setShowPayForm(false)}
              loading={createPay.isPending}
            />
          )}

          {paysLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : pagePayments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Hali to'lov usuli yo'q.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pagePayments.map(p => {
                const Ic = ICON_MAP[p.icon] ?? CreditCard;
                const isEditing = editPay?.id === p.id;
                return (
                  <div key={p.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700 shrink-0">
                        <Ic size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{p.titleUz}</div>
                        <div className="text-xs text-gray-400 truncate">{p.descUz}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.isActive ? "Faol" : "Nofaol"}
                        </span>
                        <button onClick={() => { setEditPay(p); setShowPayForm(false); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit size={14} /></button>
                        <button onClick={() => { if (confirm("O'chirilsinmi?")) deletePay.mutate(p.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                        <PaymentForm
                          payment={p}
                          onSave={(d) => updatePay.mutate({ ...d, id: p.id })}
                          onCancel={() => setEditPay(null)}
                          loading={updatePay.isPending}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
