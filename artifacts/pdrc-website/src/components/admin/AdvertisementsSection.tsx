import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Plus, Trash2, Edit, Loader2, Eye, EyeOff } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

interface Advertisement {
  id: number; titleUz: string; titleEn: string; titleRu: string;
  imageUrl: string | null; linkUrl: string | null; position: string;
  isActive: boolean; sortOrder: number; createdAt: string;
}

export function AdvertisementsSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [form, setForm] = useState({ titleUz: "", titleEn: "", titleRu: "", imageUrl: "", linkUrl: "", sortOrder: "0" });

  const { data: ads, isLoading } = useQuery<Advertisement[]>({
    queryKey: ["admin-ads"],
    queryFn: () => api.get<Advertisement[]>("/admin/advertisements"),
  });

  const createAd = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/admin/advertisements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      resetForm();
      toast({ title: lang === "uz" ? "Reklama qo'shildi" : "Ad created" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const updateAd = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/admin/advertisements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      resetForm();
      toast({ title: lang === "uz" ? "Reklama yangilandi" : "Ad updated" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => api.put(`/admin/advertisements/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-ads"] }),
  });

  const deleteAd = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/advertisements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast({ title: lang === "uz" ? "O'chirildi" : "Deleted" });
    },
  });

  function resetForm() {
    setShowForm(false);
    setEditing(null);
    setForm({ titleUz: "", titleEn: "", titleRu: "", imageUrl: "", linkUrl: "", sortOrder: "0" });
  }

  function startEdit(ad: Advertisement) {
    setEditing(ad);
    setForm({ titleUz: ad.titleUz, titleEn: ad.titleEn, titleRu: ad.titleRu, imageUrl: ad.imageUrl || "", linkUrl: ad.linkUrl || "", sortOrder: String(ad.sortOrder) });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { titleUz: form.titleUz, titleEn: form.titleEn, titleRu: form.titleRu, imageUrl: form.imageUrl || null, linkUrl: form.linkUrl || null, sortOrder: parseInt(form.sortOrder) || 0 };
    if (editing) {
      updateAd.mutate({ id: editing.id, ...data });
    } else {
      createAd.mutate(data);
    }
  }

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Reklamalar" : lang === "ru" ? "\u0420\u0435\u043a\u043b\u0430\u043c\u0430" : "Advertisements"}
        </h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={16} /> {lang === "uz" ? "Yangi reklama" : "New Ad"}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        {lang === "uz" ? "Bosh sahifada ko'rsatiladigan dumaloq reklamalar. Rasm URL va havola qo'shing." : "Circular ads displayed on the homepage. Add image URL and link."}
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-blue-200 p-6 space-y-4">
          <h3 className="font-bold text-gray-900">{editing ? (lang === "uz" ? "Reklamani tahrirlash" : "Edit Ad") : (lang === "uz" ? "Yangi reklama" : "New Ad")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-xs font-bold text-gray-500 uppercase">Title (UZ)</label><input value={form.titleUz} onChange={(e) => setForm({ ...form, titleUz: e.target.value })} className={inputClass} required /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Title (EN)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputClass} required /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Title (RU)</label><input value={form.titleRu} onChange={(e) => setForm({ ...form, titleRu: e.target.value })} className={inputClass} required /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{lang === "uz" ? "Rasm" : "Image"}</label>
              <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">{lang === "uz" ? "Havola URL" : "Link URL"}</label><input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">{lang === "uz" ? "Tartib raqami" : "Sort Order"}</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputClass} /></div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createAd.isPending || updateAd.isPending} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {(createAd.isPending || updateAd.isPending) && <Loader2 size={14} className="animate-spin" />}
              {lang === "uz" ? "Saqlash" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">{lang === "uz" ? "Bekor qilish" : "Cancel"}</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads?.map((ad) => (
            <div key={ad.id} className={`bg-white rounded-xl border p-5 transition-all ${ad.isActive ? "border-green-200" : "border-gray-200 opacity-60"}`}>
              {ad.imageUrl && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 mx-auto mb-3">
                  <img src={ad.imageUrl} alt={ad.titleUz} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="font-bold text-center text-gray-900">{lang === "uz" ? ad.titleUz : lang === "ru" ? ad.titleRu : ad.titleEn}</h3>
              <p className="text-xs text-gray-400 text-center mt-1">{ad.linkUrl || "-"}</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button onClick={() => toggleActive.mutate({ id: ad.id, isActive: !ad.isActive })} className={`p-2 rounded-lg transition-colors ${ad.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                  {ad.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => startEdit(ad)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><Edit size={16} /></button>
                <button onClick={() => deleteAd.mutate(ad.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {(!ads || ads.length === 0) && (
            <div className="col-span-full p-12 text-center text-gray-400">
              <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
              <p>{lang === "uz" ? "Reklamalar yo'q" : "No advertisements"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
