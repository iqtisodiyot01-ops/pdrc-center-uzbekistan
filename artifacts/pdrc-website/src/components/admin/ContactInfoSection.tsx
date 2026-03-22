import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Phone, Save, Loader2, Link, MessageCircle, Instagram, Youtube, Send } from "lucide-react";

interface SiteSettings {
  contacts?: {
    phone1?: string; phone2?: string; telegram?: string;
    instagram?: string; youtube?: string; whatsapp?: string;
  };
  social?: {
    telegramUrl?: string; instagramUrl?: string; youtubeUrl?: string; whatsappUrl?: string;
  };
}

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono";

export function ContactInfoSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: () => api.get<SiteSettings>("/site-settings"),
  });

  const [phones, setPhones] = useState({ phone1: "", phone2: "", whatsapp: "" });
  const [social, setSocial] = useState({ telegram: "", telegramUrl: "", instagramUrl: "", youtubeUrl: "", whatsappUrl: "" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (settings && !ready) {
      const c = settings.contacts ?? {};
      const s = settings.social ?? {};
      setPhones({ phone1: c.phone1 ?? "", phone2: c.phone2 ?? "", whatsapp: c.whatsapp ?? "" });
      setSocial({ telegram: c.telegram ?? "", telegramUrl: s.telegramUrl ?? "", instagramUrl: s.instagramUrl ?? "", youtubeUrl: s.youtubeUrl ?? "", whatsappUrl: s.whatsappUrl ?? "" });
      setReady(true);
    }
  }, [settings, ready]);

  const save = useMutation({
    mutationFn: () => api.put("/site-settings", {
      contacts: { phone1: phones.phone1, phone2: phones.phone2, telegram: social.telegram, whatsapp: phones.whatsapp },
      social: { telegramUrl: social.telegramUrl, instagramUrl: social.instagramUrl, youtubeUrl: social.youtubeUrl, whatsappUrl: social.whatsappUrl },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: lang === "uz" ? "Saqlandi" : lang === "ru" ? "Сохранено" : "Saved" });
    },
    onError: () => toast({ variant: "destructive", title: "Xatolik" }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === "uz" ? "Kontakt ma'lumotlar" : lang === "ru" ? "Контактная информация" : "Contact Info"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === "uz" ? "Saytdagi telefon raqamlar va ijtimoiy tarmoq havolalari" : lang === "ru" ? "Номера телефонов и ссылки на социальные сети" : "Phone numbers and social media links across the site"}
          </p>
        </div>
      </div>

      {/* Phone numbers */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Phone size={15} className="text-blue-600" />
          </div>
          {lang === "uz" ? "Telefon raqamlar" : lang === "ru" ? "Телефоны" : "Phone Numbers"}
        </h2>
        <p className="text-xs text-gray-400">{lang === "uz" ? "Bu raqamlar saytdagi barcha «Qo'ng'iroq» tugmalarida ishlatiladi." : lang === "ru" ? "Эти номера используются во всех кнопках «Позвонить» на сайте." : "These numbers are used in all call buttons across the site."}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">{lang === "uz" ? "Asosiy raqam" : lang === "ru" ? "Основной номер" : "Primary Number"}</label>
            <input value={phones.phone1} onChange={(e) => setPhones({ ...phones, phone1: e.target.value })} className={inputClass} placeholder="+998905783272" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">{lang === "uz" ? "Qo'shimcha raqam" : lang === "ru" ? "Дополнительный" : "Secondary Number"}</label>
            <input value={phones.phone2} onChange={(e) => setPhones({ ...phones, phone2: e.target.value })} className={inputClass} placeholder="+998974026565" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <MessageCircle size={11} className="text-green-500" /> WhatsApp {lang === "uz" ? "raqami" : lang === "ru" ? "номер" : "Number"}
            </label>
            <input value={phones.whatsapp} onChange={(e) => setPhones({ ...phones, whatsapp: e.target.value })} className={inputClass} placeholder="+998905783272" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Link size={15} className="text-purple-600" />
          </div>
          {lang === "uz" ? "Ijtimoiy tarmoqlar va havolalar" : lang === "ru" ? "Социальные сети и ссылки" : "Social Media & Links"}
        </h2>
        <p className="text-xs text-gray-400">{lang === "uz" ? "Bu havolalar saytdagi barcha tugma va ikonkalarda ishlatiladi." : lang === "ru" ? "Эти ссылки используются во всех кнопках и иконках на сайте." : "These links are used in all buttons and icons across the site."}</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Send size={11} className="text-blue-500" /> Telegram {lang === "uz" ? "kanal nomi" : lang === "ru" ? "имя канала" : "Channel Name"} <span className="font-normal text-gray-400 normal-case">(@pdrtoolls)</span>
            </label>
            <input value={social.telegram} onChange={(e) => setSocial({ ...social, telegram: e.target.value })} className={inputClass} placeholder="@pdrtoolls" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Send size={11} className="text-blue-500" /> Telegram {lang === "uz" ? "havola" : lang === "ru" ? "ссылка" : "Link"}
            </label>
            <input value={social.telegramUrl} onChange={(e) => setSocial({ ...social, telegramUrl: e.target.value })} className={inputClass} placeholder="https://t.me/pdrtoolls" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Instagram size={11} className="text-pink-500" /> Instagram {lang === "uz" ? "havola" : lang === "ru" ? "ссылка" : "Link"}
            </label>
            <input value={social.instagramUrl} onChange={(e) => setSocial({ ...social, instagramUrl: e.target.value })} className={inputClass} placeholder="https://instagram.com/pdrcenteruzbekistan" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <Youtube size={11} className="text-red-500" /> YouTube {lang === "uz" ? "havola" : lang === "ru" ? "ссылка" : "Link"}
            </label>
            <input value={social.youtubeUrl} onChange={(e) => setSocial({ ...social, youtubeUrl: e.target.value })} className={inputClass} placeholder="https://youtube.com/@pdrcenteruzbekistan" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
              <MessageCircle size={11} className="text-green-500" /> WhatsApp {lang === "uz" ? "havola" : lang === "ru" ? "ссылка" : "Link"}
            </label>
            <input value={social.whatsappUrl} onChange={(e) => setSocial({ ...social, whatsappUrl: e.target.value })} className={inputClass} placeholder="https://wa.me/998905783272" />
          </div>
        </div>
      </div>

      <button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
      >
        {save.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {lang === "uz" ? "Saqlash" : lang === "ru" ? "Сохранить" : "Save Changes"}
      </button>
    </div>
  );
}
