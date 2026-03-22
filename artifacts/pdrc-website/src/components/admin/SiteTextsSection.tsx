import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { translations } from "@/lib/i18n";
import { Save, Loader2, ChevronDown, ChevronRight, Type, RotateCcw } from "lucide-react";

type LangKey = "uz" | "en" | "ru";
type TextMap = Record<string, Record<string, string>>;
type Overrides = Record<LangKey, TextMap>;

const PAGE_LABELS: Record<string, { uz: string; icon: string }> = {
  nav: { uz: "Navigatsiya menyusi", icon: "🧭" },
  hero: { uz: "Bosh banner (Hero)", icon: "🏠" },
  home: { uz: "Asosiy sahifa", icon: "🏡" },
  services: { uz: "Xizmatlar sahifasi", icon: "🔧" },
  shop: { uz: "Do'kon sahifasi", icon: "🛒" },
  courses: { uz: "Kurslar sahifasi", icon: "🎓" },
  gallery: { uz: "Galereya sahifasi", icon: "🖼️" },
  reviews: { uz: "Sharhlar sahifasi", icon: "⭐" },
  contact: { uz: "Aloqa sahifasi", icon: "📞" },
  footer: { uz: "Footer (pastki qism)", icon: "📋" },
  common: { uz: "Umumiy tugmalar", icon: "🔘" },
};

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all";

export function SiteTextsSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: settings } = useQuery<Record<string, unknown>>({
    queryKey: ["site-settings"],
    queryFn: () => api.get<Record<string, unknown>>("/site-settings"),
  });

  const [overrides, setOverrides] = useState<Overrides>({ uz: {}, en: {}, ru: {} });
  const [expandedSection, setExpandedSection] = useState<string>("hero");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      const raw = (settings.siteTexts ?? {}) as Partial<Overrides>;
      setOverrides({
        uz: raw.uz ?? {},
        en: raw.en ?? {},
        ru: raw.ru ?? {},
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const sections = useMemo(() => Object.keys(translations.uz), []);

  const getText = (section: string, key: string, l: LangKey): string => {
    return overrides[l]?.[section]?.[key] ?? "";
  };

  const getDefault = (section: string, key: string, l: LangKey): string => {
    const base = translations[l] as Record<string, Record<string, string>>;
    return base?.[section]?.[key] ?? "";
  };

  const updateText = (section: string, key: string, l: LangKey, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [l]: {
        ...prev[l],
        [section]: { ...(prev[l][section] ?? {}), [key]: value },
      },
    }));
  };

  const resetKey = (section: string, key: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const l of ["uz", "en", "ru"] as LangKey[]) {
        const sec = { ...(prev[l][section] ?? {}) };
        delete sec[key];
        next[l] = { ...prev[l], [section]: sec };
      }
      return next;
    });
  };

  const saveSection = useMutation({
    mutationFn: () => api.put("/site-settings", { siteTexts: overrides }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: lang === "uz" ? "Saqlandi ✓" : lang === "ru" ? "Сохранено ✓" : "Saved ✓" });
    },
    onError: () => toast({ variant: "destructive", title: "Xatolik" }),
  });

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Type size={22} className="text-blue-600" />
            {lang === "uz" ? "Sayt matnlarini tahrirlash" : lang === "ru" ? "Редактировать тексты сайта" : "Edit Site Texts"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === "uz" ? "Saytning barcha sahifalaridagi matnlarni o'zgartiring. Bo'sh qoldirilgan maydonlar standart qiymatni ishlatadi." : lang === "ru" ? "Редактируйте тексты на всех страницах сайта. Пустые поля используют значения по умолчанию." : "Edit texts on all pages. Empty fields fall back to defaults."}
          </p>
        </div>
        <button
          onClick={() => saveSection.mutate()}
          disabled={saveSection.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm text-sm"
        >
          {saveSection.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {lang === "uz" ? "Hammasini saqlash" : lang === "ru" ? "Сохранить всё" : "Save All"}
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section) => {
          const sectionKeys = Object.keys((translations.uz as Record<string, Record<string, string>>)[section] ?? {});
          const label = PAGE_LABELS[section];
          const isOpen = expandedSection === section;
          const changedCount = sectionKeys.filter((k) => getText(section, k, "uz") || getText(section, k, "en") || getText(section, k, "ru")).length;

          return (
            <div key={section} className={`bg-white rounded-2xl border transition-all ${isOpen ? "border-blue-200 shadow-sm" : "border-gray-200"}`}>
              <button
                onClick={() => setExpandedSection(isOpen ? "" : section)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{label?.icon ?? "📄"}</span>
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{label?.uz ?? section}</span>
                    <span className="text-xs text-gray-400 ml-2">({sectionKeys.length} {lang === "uz" ? "ta matn" : lang === "ru" ? "текстов" : "texts"})</span>
                    {changedCount > 0 && (
                      <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{changedCount} {lang === "uz" ? "ta o'zgartirilgan" : "changed"}</span>
                    )}
                  </div>
                </div>
                {isOpen ? <ChevronDown size={18} className="text-blue-500" /> : <ChevronRight size={18} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                    <div className="col-span-3">Kalit</div>
                    <div className="col-span-3">🇺🇿 O'zbekcha</div>
                    <div className="col-span-3">🇷🇺 Ruscha</div>
                    <div className="col-span-3">🇬🇧 English</div>
                  </div>
                  {sectionKeys.map((key) => {
                    const hasOverride = getText(section, key, "uz") || getText(section, key, "en") || getText(section, key, "ru");
                    return (
                      <div key={key} className={`grid grid-cols-12 gap-2 items-start py-2 px-1 rounded-xl transition-colors ${hasOverride ? "bg-blue-50/50" : ""}`}>
                        <div className="col-span-3 pt-2">
                          <div className="flex items-center gap-1.5">
                            <code className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{key}</code>
                            {hasOverride && (
                              <button onClick={() => resetKey(section, key)} title="Reset to default" className="text-gray-300 hover:text-red-400 transition-colors">
                                <RotateCcw size={11} />
                              </button>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-400 mt-1 truncate" title={getDefault(section, key, "uz")}>{getDefault(section, key, "uz")}</p>
                        </div>
                        {(["uz", "ru", "en"] as LangKey[]).map((l) => (
                          <div key={l} className="col-span-3">
                            <input
                              value={getText(section, key, l)}
                              onChange={(e) => updateText(section, key, l, e.target.value)}
                              className={inputClass}
                              placeholder={getDefault(section, key, l)}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => saveSection.mutate()}
          disabled={saveSection.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
        >
          {saveSection.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {lang === "uz" ? "Hammasini saqlash" : lang === "ru" ? "Сохранить всё" : "Save All"}
        </button>
      </div>
    </div>
  );
}
