import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Loader2, Save, X } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

interface ContentItem {
  id: number;
  [key: string]: unknown;
}

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "image";
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface ContentSectionProps {
  title: string;
  apiPath: string;
  queryKey: string;
  fields: FieldDef[];
  displayFn: (item: ContentItem, lang: string) => { title: string; subtitle?: string; meta?: string; badge?: string; image?: string };
  defaultValues?: Record<string, unknown>;
}

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200";

export function ContentSection({ title, apiPath, queryKey, fields, displayFn, defaultValues }: ContentSectionProps) {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(defaultValues || {});

  const { data: items, isLoading } = useQuery<ContentItem[]>({
    queryKey: [queryKey],
    queryFn: () => api.get<ContentItem[]>(`/${apiPath}`),
  });

  const createItem = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post(`/${apiPath}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); resetForm(); toast({ title: lang === "uz" ? "Qo'shildi" : "Created" }); },
    onError: (err: unknown) => toast({ variant: "destructive", title: lang === "uz" ? "Xato" : "Error", description: err instanceof Error ? err.message : String(err) }),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/${apiPath}/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); resetForm(); toast({ title: lang === "uz" ? "Yangilandi" : "Updated" }); },
    onError: (err: unknown) => toast({ variant: "destructive", title: lang === "uz" ? "Xato" : "Error", description: err instanceof Error ? err.message : String(err) }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => api.delete(`/${apiPath}/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); toast({ title: lang === "uz" ? "O'chirildi" : "Deleted" }); },
  });

  function resetForm() {
    setShowForm(false);
    setEditing(null);
    setForm(defaultValues || {});
  }

  function startEdit(item: ContentItem) {
    setEditing(item);
    const formData: Record<string, unknown> = {};
    fields.forEach((f) => { formData[f.key] = item[f.key] ?? (defaultValues?.[f.key] || ""); });
    setForm(formData);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "number") data[f.key] = Number(form[f.key]) || 0;
      else if (f.type === "checkbox") data[f.key] = !!form[f.key];
      else data[f.key] = form[f.key] || (f.type === "text" || f.type === "textarea" ? "" : null);
    });
    if (editing) updateItem.mutate({ id: editing.id, ...data });
    else createItem.mutate(data);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={16} /> {lang === "uz" ? "Yangi qo'shish" : "Add New"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-blue-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{editing ? (lang === "uz" ? "Tahrirlash" : "Edit") : (lang === "uz" ? "Yangi" : "New")}</h3>
            <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "col-span-full" : ""}>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{field.label}</label>
                {field.type === "image" ? (
                  <ImageUpload value={String(form[field.key] || "")} onChange={(url) => setForm({ ...form, [field.key]: url })} />
                ) : field.type === "textarea" ? (
                  <textarea value={String(form[field.key] || "")} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className={`${inputClass} resize-none h-24`} required={field.required} placeholder={field.placeholder} />
                ) : field.type === "select" ? (
                  <select value={String(form[field.key] || "")} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className={inputClass}>
                    {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input type="checkbox" checked={!!form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                ) : (
                  <input type={field.type} value={String(form[field.key] || "")} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className={inputClass} required={field.required} placeholder={field.placeholder} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createItem.isPending || updateItem.isPending} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {(createItem.isPending || updateItem.isPending) && <Loader2 size={14} className="animate-spin" />}
              <Save size={14} /> {lang === "uz" ? "Saqlash" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">{lang === "uz" ? "Bekor qilish" : "Cancel"}</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items?.map((item) => {
            const display = displayFn(item, lang);
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition-colors">
                <div className="flex items-start gap-4">
                  {display.image && (
                    <img src={display.image} alt="" className="w-16 h-12 object-cover rounded border border-gray-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    {display.badge && (
                      <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">{display.badge}</span>
                    )}
                    <div className="font-bold text-gray-900 truncate">{display.title}</div>
                    {display.subtitle && <div className="text-sm text-gray-500 truncate">{display.subtitle}</div>}
                    {display.meta && <div className="text-sm text-blue-700 font-mono mt-1">{display.meta}</div>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(item)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit size={16} /></button>
                    <button onClick={() => deleteItem.mutate(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {(!items || items.length === 0) && (
            <div className="col-span-full p-12 text-center text-gray-400 text-sm">{lang === "uz" ? "Ma'lumotlar yo'q" : "No data"}</div>
          )}
        </div>
      )}
    </div>
  );
}
