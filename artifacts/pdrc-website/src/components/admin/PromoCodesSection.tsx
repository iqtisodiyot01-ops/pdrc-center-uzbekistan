import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Check, X, Ticket, Copy, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface PromoCode {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const emptyForm = {
  code: "", discountType: "percent", discountValue: 10,
  minOrderAmount: 0, maxUses: "", isActive: true, expiresAt: "",
};

export function PromoCodesSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const l = lang === "uz"
    ? { title: "Promo kodlar", add: "Yangi kod", code: "Kod", type: "Tur", percent: "Foiz (%)", fixed: "Belgilangan (UZS)", value: "Miqdor", min: "Minimal summa", maxUses: "Maks foydalanish", expires: "Amal qilish muddati", active: "Faol", save: "Saqlash", cancel: "Bekor", used: "Ishlatildi", unlimited: "Cheksiz", copy: "Nusxalandi", noData: "Promo kodlar yo'q" }
    : lang === "ru"
    ? { title: "Промо коды", add: "Новый код", code: "Код", type: "Тип", percent: "Процент (%)", fixed: "Фиксированный (UZS)", value: "Размер", min: "Мин. сумма", maxUses: "Макс. использований", expires: "Срок действия", active: "Активный", save: "Сохранить", cancel: "Отмена", used: "Использовано", unlimited: "Безлимитно", copy: "Скопировано", noData: "Промо кодов нет" }
    : { title: "Promo Codes", add: "New code", code: "Code", type: "Type", percent: "Percent (%)", fixed: "Fixed (UZS)", value: "Value", min: "Min order", maxUses: "Max uses", expires: "Expires at", active: "Active", save: "Save", cancel: "Cancel", used: "Used", unlimited: "Unlimited", copy: "Copied", noData: "No promo codes" };

  const { data: codes = [], isLoading } = useQuery<PromoCode[]>({
    queryKey: ["promo-codes"],
    queryFn: () => api.get("/admin/promo-codes"),
  });

  const onErr = (err: Error) => toast({ variant: "destructive", title: "Xatolik", description: err.message });

  const createMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/admin/promo-codes", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["promo-codes"] }); setShowForm(false); setForm({ ...emptyForm }); toast({ title: "Saqlandi" }); },
    onError: onErr,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.patch(`/admin/promo-codes/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["promo-codes"] }); setEditId(null); toast({ title: "Yangilandi" }); },
    onError: onErr,
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/promo-codes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["promo-codes"] }); toast({ title: "O'chirildi" }); },
    onError: onErr,
  });

  const toggleActive = (code: PromoCode) => updateMut.mutate({ id: code.id, data: { isActive: !code.isActive } });

  const handleSave = () => {
    const data = {
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      isActive: form.isActive,
      expiresAt: form.expiresAt || null,
    };
    if (editId) updateMut.mutate({ id: editId, data });
    else createMut.mutate(data);
  };

  const startEdit = (c: PromoCode) => {
    setEditId(c.id);
    setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount, maxUses: c.maxUses?.toString() ?? "", isActive: c.isActive, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "" });
    setShowForm(true);
  };

  const isExpired = (c: PromoCode) => !!c.expiresAt && new Date(c.expiresAt) < new Date();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Ticket size={20} className="text-purple-600" />{l.title}</h2>
        <button onClick={() => { setEditId(null); setForm({ ...emptyForm }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">
          <Plus size={16} />{l.add}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">{l.code}</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="PDRC20" className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono font-bold uppercase" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">{l.type}</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="percent">{l.percent}</option>
                <option value="fixed">{l.fixed}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">{l.value}</label>
              <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">{l.min} (UZS)</label>
              <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">{l.maxUses}</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder={l.unlimited} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">{l.expires}</label>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
            <span className="text-sm font-medium text-gray-700">{l.active}</span>
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{l.save}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
              <X size={14} />{l.cancel}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-purple-600" /></div>
      ) : codes.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><Ticket size={48} className="mx-auto mb-3 opacity-30" /><p>{l.noData}</p></div>
      ) : (
        <div className="space-y-3">
          {codes.map((c) => (
            <div key={c.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${isExpired(c) ? "border-red-200 bg-red-50" : c.isActive ? "border-gray-200" : "border-gray-100 bg-gray-50 opacity-70"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg text-sm tracking-widest">{c.code}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    {c.discountType === "percent" ? `-${c.discountValue}%` : `-${c.discountValue.toLocaleString()} UZS`}
                  </span>
                  {isExpired(c) && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">Muddati tugagan</span>}
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                  <span>Min: {c.minOrderAmount.toLocaleString()} UZS</span>
                  <span>{l.used}: {c.usedCount} / {c.maxUses ?? "∞"}</span>
                  {c.expiresAt && <span>→ {new Date(c.expiresAt).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { navigator.clipboard.writeText(c.code); toast({ title: l.copy }); }} className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"><Copy size={15} /></button>
                <button onClick={() => toggleActive(c)} className={`p-1.5 rounded-lg ${c.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                  {c.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => startEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15} /></button>
                <button onClick={() => deleteMut.mutate(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
