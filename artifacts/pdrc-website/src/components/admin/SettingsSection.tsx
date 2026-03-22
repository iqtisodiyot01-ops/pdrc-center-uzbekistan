import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Globe, MapPin, Clock, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

interface SiteSettings {
  [key: string]: unknown;
}

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

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

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      const contacts = (settings.contacts ?? {}) as Record<string, string>;
      const branding = (settings.branding ?? {}) as Record<string, string>;
      setForm({
        address: contacts.address ?? "",
        workingHours: (settings as Record<string, string>).workingHours ?? "Dush-Shan: 09:00 - 18:00",
        siteNameUz: branding.siteNameUz ?? "PDR Center Uzbekistan",
        taglineUz: branding.taglineUz ?? "",
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const updateSettings = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put("/site-settings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: lang === "uz" ? "Saqlandi" : lang === "ru" ? "Сохранено" : "Saved" });
    },
    onError: () => toast({ variant: "destructive", title: "Xatolik" }),
  });

  const changePassword = useMutation({
    mutationFn: () => api.put("/auth/change-password", { currentPassword: pwForm.current, newPassword: pwForm.next }),
    onSuccess: () => {
      setPwForm({ current: "", next: "", confirm: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
      toast({ title: lang === "uz" ? "Parol o'zgartirildi" : lang === "ru" ? "Пароль изменён" : "Password changed" });
    },
    onError: (err: Error) => {
      const msg = (err as { message?: string }).message ?? "";
      const isWrong = msg.includes("incorrect") || msg.includes("401");
      toast({
        variant: "destructive",
        title: lang === "uz" ? (isWrong ? "Joriy parol noto'g'ri" : "Xatolik") : lang === "ru" ? (isWrong ? "Текущий пароль неверен" : "Ошибка") : (isWrong ? "Current password incorrect" : "Error"),
      });
    },
  });

  const handleSave = () => {
    updateSettings.mutate({
      workingHours: form.workingHours,
      branding: { siteNameUz: form.siteNameUz, taglineUz: form.taglineUz },
    });
  };

  const handlePwChange = () => {
    if (!pwForm.current || !pwForm.next || pwForm.next.length < 6) {
      toast({ variant: "destructive", title: lang === "uz" ? "Parol kamida 6 belgi bo'lishi kerak" : "Password must be at least 6 characters" });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast({ variant: "destructive", title: lang === "uz" ? "Yangi parollar mos kelmadi" : lang === "ru" ? "Пароли не совпадают" : "Passwords don't match" });
      return;
    }
    changePassword.mutate();
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Sayt sozlamalari" : lang === "ru" ? "Настройки сайта" : "Site Settings"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{lang === "uz" ? "Umumiy sozlamalar va ish vaqti" : lang === "ru" ? "Общие настройки и рабочее время" : "General settings and working hours"}</p>
      </div>

      {/* General settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Globe size={17} className="text-blue-600" />
          {lang === "uz" ? "Umumiy ma'lumotlar" : lang === "ru" ? "Общие данные" : "General Info"}
        </h2>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><MapPin size={11} />{lang === "uz" ? "Manzil" : lang === "ru" ? "Адрес" : "Address"}</label>
          <input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} placeholder="Toshkent, O'zbekiston" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Clock size={11} />{lang === "uz" ? "Ish vaqti" : lang === "ru" ? "Рабочее время" : "Working Hours"}</label>
          <input value={form.workingHours ?? ""} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} className={inputClass} placeholder="Dush-Shan: 09:00 - 18:00" />
        </div>
        <button onClick={handleSave} disabled={updateSettings.isPending} className="flex items-center gap-2 px-5 py-2 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors text-sm">
          {updateSettings.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {lang === "uz" ? "Saqlash" : lang === "ru" ? "Сохранить" : "Save"}
        </button>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Lock size={17} className="text-orange-500" />
          {lang === "uz" ? "Parolni o'zgartirish" : lang === "ru" ? "Изменить пароль" : "Change Password"}
        </h2>
        <p className="text-xs text-gray-500">
          {lang === "uz" ? "Kirish parоlingizni o'zgartiring. Yangi parol kamida 6 belgidan iborat bo'lishi kerak." : lang === "ru" ? "Измените пароль для входа. Минимум 6 символов." : "Change your login password. Minimum 6 characters."}
        </p>
        {pwSuccess && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm font-medium">
            <CheckCircle size={16} /> {lang === "uz" ? "Parol muvaffaqiyatli o'zgartirildi!" : lang === "ru" ? "Пароль успешно изменён!" : "Password changed successfully!"}
          </div>
        )}
        <div className="relative">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">{lang === "uz" ? "Joriy parol" : lang === "ru" ? "Текущий пароль" : "Current Password"}</label>
          <input type={showPw ? "text" : "password"} value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} className={inputClass} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">{lang === "uz" ? "Yangi parol" : lang === "ru" ? "Новый пароль" : "New Password"}</label>
          <input type={showPw ? "text" : "password"} value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} className={inputClass} placeholder={lang === "uz" ? "Kamida 6 belgi" : "Min 6 characters"} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">{lang === "uz" ? "Yangi parolni tasdiqlang" : lang === "ru" ? "Подтвердите пароль" : "Confirm New Password"}</label>
          <input type={showPw ? "text" : "password"} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className={inputClass} />
        </div>
        <button
          onClick={handlePwChange}
          disabled={changePassword.isPending || !pwForm.current || !pwForm.next || !pwForm.confirm}
          className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm"
        >
          {changePassword.isPending ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
          {lang === "uz" ? "Parolni o'zgartirish" : lang === "ru" ? "Изменить пароль" : "Change Password"}
        </button>
      </div>
    </div>
  );
}
