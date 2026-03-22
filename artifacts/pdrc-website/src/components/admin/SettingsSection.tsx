import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Loader2, Globe, Phone, Mail, MapPin } from "lucide-react";

interface SiteSettings {
  [key: string]: unknown;
}

export function SettingsSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: () => api.get<SiteSettings>("/site-settings"),
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    const s = settings as Record<string, unknown>;
    setForm({
      phone: String(s.phone || ""),
      email: String(s.email || ""),
      address: String(s.address || ""),
      telegram: String(s.telegram || ""),
      instagram: String(s.instagram || ""),
      facebook: String(s.facebook || ""),
      workingHours: String(s.workingHours || ""),
      footerTextUz: String(s.footerTextUz || ""),
      footerTextEn: String(s.footerTextEn || ""),
      footerTextRu: String(s.footerTextRu || ""),
    });
    setInitialized(true);
  }

  const updateSettings = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put("/site-settings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: lang === "uz" ? "Sozlamalar saqlandi" : "Settings saved" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200";

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {lang === "uz" ? "Sayt sozlamalari" : lang === "ru" ? "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u0441\u0430\u0439\u0442\u0430" : "Site Settings"}
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Globe size={18} className="text-blue-600" />
            {lang === "uz" ? "Aloqa ma'lumotlari" : "Contact Information"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><Phone size={12} /> {lang === "uz" ? "Telefon" : "Phone"}</label>
              <input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+998 90 123 45 67" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><Mail size={12} /> Email</label>
              <input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="info@example.com" />
            </div>
            <div className="col-span-full">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><MapPin size={12} /> {lang === "uz" ? "Manzil" : "Address"}</label>
              <input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-4">{lang === "uz" ? "Ijtimoiy tarmoqlar" : "Social Media"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Telegram</label>
              <input value={form.telegram || ""} onChange={(e) => setForm({ ...form, telegram: e.target.value })} className={inputClass} placeholder="@pdrcenter" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Instagram</label>
              <input value={form.instagram || ""} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className={inputClass} placeholder="@pdrcenter" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Facebook</label>
              <input value={form.facebook || ""} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-4">{lang === "uz" ? "Ish vaqti" : "Working Hours"}</h3>
          <input value={form.workingHours || ""} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} className={inputClass} placeholder="Mon-Sat: 09:00 - 18:00" />
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-4">{lang === "uz" ? "Footer matni" : "Footer Text"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">UZ</label>
              <textarea value={form.footerTextUz || ""} onChange={(e) => setForm({ ...form, footerTextUz: e.target.value })} className={`${inputClass} resize-none h-20`} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">EN</label>
              <textarea value={form.footerTextEn || ""} onChange={(e) => setForm({ ...form, footerTextEn: e.target.value })} className={`${inputClass} resize-none h-20`} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">RU</label>
              <textarea value={form.footerTextRu || ""} onChange={(e) => setForm({ ...form, footerTextRu: e.target.value })} className={`${inputClass} resize-none h-20`} />
            </div>
          </div>
        </div>

        <button
          onClick={() => updateSettings.mutate(form)}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {updateSettings.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {lang === "uz" ? "Saqlash" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
