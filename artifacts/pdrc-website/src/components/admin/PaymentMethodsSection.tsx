import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Save, CreditCard, Loader2, Eye, EyeOff } from "lucide-react";

interface PaymentMethodsConfig {
  payme: { enabled: boolean; merchantId: string; secretKey: string };
  click: { enabled: boolean; serviceId: string; merchantId: string; secretKey: string };
  uzumbank: { enabled: boolean; url: string };
  paynet: { enabled: boolean; url: string };
  visaCard: { enabled: boolean; cardNumber: string; cardHolder: string };
  uzcardCard: { enabled: boolean; cardNumber: string; cardHolder: string };
}

const DEFAULT_CFG: PaymentMethodsConfig = {
  payme: { enabled: false, merchantId: "", secretKey: "" },
  click: { enabled: false, serviceId: "", merchantId: "", secretKey: "" },
  uzumbank: { enabled: false, url: "" },
  paynet: { enabled: false, url: "" },
  visaCard: { enabled: false, cardNumber: "", cardHolder: "" },
  uzcardCard: { enabled: false, cardNumber: "", cardHolder: "" },
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-mono"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function MethodCard({ title, icon, enabled, onToggle, children }: {
  title: string; icon: React.ReactNode; enabled: boolean; onToggle: (v: boolean) => void; children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border-2 transition-all ${enabled ? "border-blue-200 bg-blue-50/30" : "border-gray-100 bg-white"}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${enabled ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
            {icon}
          </div>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {enabled && children && (
        <div className="px-4 pb-4 space-y-3 border-t border-blue-100 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

export function PaymentMethodsSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [cfg, setCfg] = useState<PaymentMethodsConfig | null>(null);

  const t = {
    uz: {
      title: "To'lov usullari",
      desc: "Saytda ko'rinadigan to'lov usullarini sozlang",
      save: "Saqlash",
      saving: "Saqlanmoqda...",
      saved: "Saqlandi!",
      merchantId: "Merchant ID",
      secretKey: "Secret Key",
      serviceId: "Service ID",
      url: "To'lov URL manzili",
      urlHint: "Merchant checkout sahifasining to'liq URL manzilini kiriting",
      cardNumber: "Karta raqami",
      cardHolder: "Karta egasining ismi",
      visa: "Visa / Mastercard karta",
      uzcard: "Uzcard / Humo karta",
      intl: "Xalqaro to'lov tizimlari",
      local: "Mahalliy to'lov tizimlari",
      transfer: "To'g'ridan-to'g'ri karta o'tkazma",
    },
    ru: {
      title: "Способы оплаты",
      desc: "Настройте способы оплаты на сайте",
      save: "Сохранить",
      saving: "Сохранение...",
      saved: "Сохранено!",
      merchantId: "Merchant ID",
      secretKey: "Секретный ключ",
      serviceId: "Service ID",
      url: "URL платёжной страницы",
      urlHint: "Введите полный URL страницы оплаты мерчанта",
      cardNumber: "Номер карты",
      cardHolder: "Имя держателя карты",
      visa: "Карта Visa / Mastercard",
      uzcard: "Карта Uzcard / Humo",
      intl: "Международные платёжные системы",
      local: "Местные платёжные системы",
      transfer: "Прямой перевод на карту",
    },
    en: {
      title: "Payment Methods",
      desc: "Configure which payment methods appear on the site",
      save: "Save",
      saving: "Saving...",
      saved: "Saved!",
      merchantId: "Merchant ID",
      secretKey: "Secret Key",
      serviceId: "Service ID",
      url: "Payment Page URL",
      urlHint: "Enter the full merchant checkout page URL",
      cardNumber: "Card Number",
      cardHolder: "Cardholder Name",
      visa: "Visa / Mastercard Card",
      uzcard: "Uzcard / Humo Card",
      intl: "International Payment Systems",
      local: "Local Payment Systems",
      transfer: "Direct Card Transfer",
    },
  }[lang as "uz" | "ru" | "en"] ?? {
    title: "Payment Methods", desc: "", save: "Save", saving: "Saving...", saved: "Saved!",
    merchantId: "Merchant ID", secretKey: "Secret Key", serviceId: "Service ID",
    url: "URL", urlHint: "URL", cardNumber: "Card Number", cardHolder: "Holder",
    visa: "Visa/Mastercard", uzcard: "Uzcard/Humo", intl: "International", local: "Local", transfer: "Transfer",
  };

  const [initialized, setInitialized] = useState(false);

  const { data: pmConfig } = useQuery<Partial<PaymentMethodsConfig>>({
    queryKey: ["admin-payment-methods-config"],
    queryFn: () => api.get<Partial<PaymentMethodsConfig>>("/admin/payment-methods-config"),
  });

  useEffect(() => {
    if (pmConfig && !initialized) {
      setCfg({
        payme: { ...DEFAULT_CFG.payme, ...pmConfig.payme },
        click: { ...DEFAULT_CFG.click, ...pmConfig.click },
        uzumbank: { ...DEFAULT_CFG.uzumbank, ...pmConfig.uzumbank },
        paynet: { ...DEFAULT_CFG.paynet, ...pmConfig.paynet },
        visaCard: { ...DEFAULT_CFG.visaCard, ...pmConfig.visaCard },
        uzcardCard: { ...DEFAULT_CFG.uzcardCard, ...pmConfig.uzcardCard },
      });
      setInitialized(true);
    }
  }, [pmConfig, initialized]);

  const saveMutation = useMutation({
    mutationFn: () => api.put("/site-settings", { paymentMethods: cfg }),
    onSuccess: () => {
      toast({ title: t.saved });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (err: Error) => toast({ title: lang === "uz" ? "Xatolik" : "Error", description: err.message, variant: "destructive" }),
  });

  const update = <K extends keyof PaymentMethodsConfig>(key: K, patch: Partial<PaymentMethodsConfig[K]>) => {
    setCfg((prev) => prev ? { ...prev, [key]: { ...prev[key], ...patch } } : prev);
  };

  if (!cfg) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500">{t.desc}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t.intl}</h2>
          <div className="space-y-3">
            <MethodCard
              title="Payme"
              icon="P"
              enabled={cfg.payme.enabled}
              onToggle={(v) => update("payme", { enabled: v })}
            >
              <FieldRow label={t.merchantId}>
                <input
                  type="text"
                  value={cfg.payme.merchantId}
                  onChange={(e) => update("payme", { merchantId: e.target.value })}
                  placeholder="6740e0b8b25cc7b450c02952"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-mono"
                />
              </FieldRow>
              <FieldRow label={t.secretKey}>
                <SecretInput
                  value={cfg.payme.secretKey}
                  onChange={(v) => update("payme", { secretKey: v })}
                  placeholder="••••••••••••••••"
                />
              </FieldRow>
            </MethodCard>

            <MethodCard
              title="Click"
              icon="C"
              enabled={cfg.click.enabled}
              onToggle={(v) => update("click", { enabled: v })}
            >
              <FieldRow label={t.serviceId}>
                <input
                  type="text"
                  value={cfg.click.serviceId}
                  onChange={(e) => update("click", { serviceId: e.target.value })}
                  placeholder="12345"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-mono"
                />
              </FieldRow>
              <FieldRow label={t.merchantId}>
                <input
                  type="text"
                  value={cfg.click.merchantId}
                  onChange={(e) => update("click", { merchantId: e.target.value })}
                  placeholder="67890"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-mono"
                />
              </FieldRow>
              <FieldRow label={t.secretKey}>
                <SecretInput
                  value={cfg.click.secretKey}
                  onChange={(v) => update("click", { secretKey: v })}
                  placeholder="••••••••••••••••"
                />
              </FieldRow>
            </MethodCard>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t.local}</h2>
          <div className="space-y-3">
            <MethodCard
              title="Uzumbank"
              icon="U"
              enabled={cfg.uzumbank.enabled}
              onToggle={(v) => update("uzumbank", { enabled: v })}
            >
              <FieldRow label={t.url}>
                <input
                  type="url"
                  value={cfg.uzumbank.url}
                  onChange={(e) => update("uzumbank", { url: e.target.value })}
                  placeholder="https://checkout.uzumbank.uz/pay?merchant_id=..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1">{t.urlHint}</p>
              </FieldRow>
            </MethodCard>

            <MethodCard
              title="Paynet"
              icon="N"
              enabled={cfg.paynet.enabled}
              onToggle={(v) => update("paynet", { enabled: v })}
            >
              <FieldRow label={t.url}>
                <input
                  type="url"
                  value={cfg.paynet.url}
                  onChange={(e) => update("paynet", { url: e.target.value })}
                  placeholder="https://paynet.uz/processing/pay?id=..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1">{t.urlHint}</p>
              </FieldRow>
            </MethodCard>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t.transfer}</h2>
          <div className="space-y-3">
            <MethodCard
              title={t.visa}
              icon="💳"
              enabled={cfg.visaCard.enabled}
              onToggle={(v) => update("visaCard", { enabled: v })}
            >
              <FieldRow label={t.cardNumber}>
                <input
                  type="text"
                  value={cfg.visaCard.cardNumber}
                  onChange={(e) => update("visaCard", { cardNumber: e.target.value })}
                  placeholder="4276 3800 1234 5678"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-mono tracking-widest"
                />
              </FieldRow>
              <FieldRow label={t.cardHolder}>
                <input
                  type="text"
                  value={cfg.visaCard.cardHolder}
                  onChange={(e) => update("visaCard", { cardHolder: e.target.value })}
                  placeholder="JOHN DOE"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 uppercase"
                />
              </FieldRow>
            </MethodCard>

            <MethodCard
              title={t.uzcard}
              icon="🏦"
              enabled={cfg.uzcardCard.enabled}
              onToggle={(v) => update("uzcardCard", { enabled: v })}
            >
              <FieldRow label={t.cardNumber}>
                <input
                  type="text"
                  value={cfg.uzcardCard.cardNumber}
                  onChange={(e) => update("uzcardCard", { cardNumber: e.target.value })}
                  placeholder="8600 1234 5678 9012"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-mono tracking-widest"
                />
              </FieldRow>
              <FieldRow label={t.cardHolder}>
                <input
                  type="text"
                  value={cfg.uzcardCard.cardHolder}
                  onChange={(e) => update("uzcardCard", { cardHolder: e.target.value })}
                  placeholder="ABDULLAYEV JASUR"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 uppercase"
                />
              </FieldRow>
            </MethodCard>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-60 transition-all shadow-md shadow-blue-200"
        >
          {saveMutation.isPending ? (
            <><Loader2 size={16} className="animate-spin" />{t.saving}</>
          ) : (
            <><Save size={16} />{t.save}</>
          )}
        </button>
      </div>
    </div>
  );
}
