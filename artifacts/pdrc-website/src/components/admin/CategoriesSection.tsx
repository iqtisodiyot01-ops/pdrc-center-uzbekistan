import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Trash2, Edit, Loader2, Check, X } from "lucide-react";

interface Category {
  id: number;
  nameUz: string;
  nameEn: string;
  nameRu: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200";

export function CategoriesSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ nameUz: "", nameEn: "", nameRu: "", icon: "📦", sortOrder: "0" });

  const { data: cats, isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => api.get<Category[]>("/admin/categories"),
  });

  const createCat = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/admin/categories", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["categories"] }); reset(); toast({ title: lang === "uz" ? "Kategoriya qo'shildi" : "Category created" }); },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const updateCat = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/admin/categories/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["categories"] }); reset(); toast({ title: lang === "uz" ? "Yangilandi" : "Updated" }); },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const deleteCat = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["categories"] }); toast({ title: lang === "uz" ? "O'chirildi" : "Deleted" }); },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => api.put(`/admin/categories/${id}`, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["categories"] }); },
  });

  function reset() {
    setShowForm(false);
    setEditing(null);
    setForm({ nameUz: "", nameEn: "", nameRu: "", icon: "📦", sortOrder: "0" });
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setForm({ nameUz: cat.nameUz, nameEn: cat.nameEn, nameRu: cat.nameRu, icon: cat.icon || "📦", sortOrder: String(cat.sortOrder) });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { nameUz: form.nameUz, nameEn: form.nameEn, nameRu: form.nameRu, icon: form.icon, sortOrder: parseInt(form.sortOrder) || 0 };
    if (editing) updateCat.mutate({ id: editing.id, ...data });
    else createCat.mutate(data);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Mahsulot Kategoriyalari" : lang === "ru" ? "Категории товаров" : "Product Categories"}
        </h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={16} /> {lang === "uz" ? "Yangi kategoriya" : "New Category"}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        {lang === "uz" ? "Mahsulotlar uchun kategoriyalar. Har bir mahsulot bitta kategoriyaga tegishli bo'ladi." : "Categories for products. Each product belongs to one category."}
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-blue-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{editing ? (lang === "uz" ? "Tahrirlash" : "Edit") : (lang === "uz" ? "Yangi kategoriya" : "New Category")}</h3>
            <button type="button" onClick={reset} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nomi (UZ)</label>
              <input value={form.nameUz} onChange={(e) => setForm({ ...form, nameUz: e.target.value })} className={inputClass} required placeholder="Masalan: Kanchallar" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Name (EN)</label>
              <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputClass} required placeholder="e.g. Hooks & Tools" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Название (RU)</label>
              <input value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })} className={inputClass} required placeholder="напр. Крючки и инструменты" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{lang === "uz" ? "Emoji belgisi" : "Icon (emoji)"}</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputClass} placeholder="📦" maxLength={4} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{lang === "uz" ? "Tartib" : "Sort Order"}</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createCat.isPending || updateCat.isPending} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {(createCat.isPending || updateCat.isPending) && <Loader2 size={14} className="animate-spin" />}
              <Check size={14} /> {lang === "uz" ? "Saqlash" : "Save"}
            </button>
            <button type="button" onClick={reset} className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">{lang === "uz" ? "Bekor qilish" : "Cancel"}</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats?.map((cat) => (
            <div key={cat.id} className={`bg-white rounded-xl border p-5 transition-all ${cat.isActive ? "border-gray-200 hover:border-blue-200" : "border-red-100 opacity-60"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon || "📦"}</span>
                  <div>
                    <div className="font-bold text-gray-900">{lang === "uz" ? cat.nameUz : lang === "ru" ? cat.nameRu : cat.nameEn}</div>
                    <div className="text-xs text-gray-400">{cat.nameUz} / {cat.nameEn}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{lang === "uz" ? "Tartib" : "Order"}: {cat.sortOrder}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive.mutate({ id: cat.id, isActive: !cat.isActive })}
                    className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${cat.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
                    {cat.isActive ? (lang === "uz" ? "Faol" : "Active") : (lang === "uz" ? "Nofaol" : "Inactive")}
                  </button>
                  <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit size={14} /></button>
                  <button onClick={() => deleteCat.mutate(cat.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {(!cats || cats.length === 0) && (
            <div className="col-span-full p-12 text-center text-gray-400">
              <Tag size={40} className="mx-auto mb-3 opacity-30" />
              <p>{lang === "uz" ? "Kategoriyalar yo'q" : "No categories"}</p>
              <p className="text-xs mt-2">{lang === "uz" ? "Yuqoridagi tugmani bosib kategoriya qo'shing" : "Click the button above to add categories"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
