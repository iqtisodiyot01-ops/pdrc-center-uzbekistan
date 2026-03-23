import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAppStore } from "@/store/use-store";
import { api } from "@/lib/api";
import { Phone, MapPin, Mail, Instagram, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Contact() {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError("");
    try {
      await api.post("/contact-messages", {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        subject: lang === "uz" ? "Aloqa formi orqali" : lang === "ru" ? "Через форму обратной связи" : "Via contact form",
        message: data.message || `${lang === "uz" ? "Telefon raqam" : "Phone"}: ${data.phone}`,
      });
      setSuccess(true);
      reset();
    } catch {
      setError(lang === "uz" ? "Xato yuz berdi. Qayta urinib ko'ring." : lang === "ru" ? "Произошла ошибка. Попробуйте снова." : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pb-24 bg-gray-50">
      <div className="bg-[#0f3460] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="section-badge-dark mx-auto">PDR Center Uzbekistan</div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight mb-4">
            {t.contact.heading} <span className="text-blue-300">{t.contact.highlight}</span>
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t.contact.desc}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 flex flex-col lg:flex-row gap-10">

        {/* Contact Info */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-heading font-bold text-[#0f3460] mb-8 leading-snug">{t.contact.info_title}</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{t.contact.phones}</h4>
                  <p className="text-gray-500 text-sm">+998 90 578 32 72</p>
                  <p className="text-gray-500 text-sm">+998 97 402 65 65 ({t.contact.manager})</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{t.contact.location}</h4>
                  <p className="text-gray-500 text-sm">{t.contact.location_city}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{t.contact.social}</h4>
                  <div className="flex gap-3 mt-2">
                    <a href="https://instagram.com/pdrcenteruzbekistan" target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white transition-all">
                      <Instagram size={16} />
                    </a>
                    <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white transition-all">
                      <Send size={16} />
                    </a>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">@pdrcenteruzbekistan</p>
                  <p className="text-gray-400 text-sm">@pdrtoolls (Telegram)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick contact buttons */}
          <div className="flex flex-col gap-3">
            <a href="tel:+998905783272"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors">
              <Phone size={18} /> +998 90 578 32 72
            </a>
            <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-[#0f3460] text-white rounded-xl font-bold hover:bg-[#1a4f8a] transition-colors">
              <Send size={18} /> @pdrtoolls (Telegram)
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="lg:w-2/3 bg-white p-8 md:p-10 rounded-2xl border border-gray-200">
          <h2 className="text-2xl font-heading font-bold text-[#0f3460] mb-2 leading-snug">{t.contact.form_title}</h2>
          <p className="text-gray-500 mb-8 text-sm">{t.contact.form_desc}</p>

          {success ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 size={44} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">
                {lang === "uz" ? "Xabaringiz yuborildi!" : lang === "ru" ? "Сообщение отправлено!" : "Message Sent!"}
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm">
                {lang === "uz"
                  ? "Tez orada siz bilan bog'lanamiz. Sabr qiling!"
                  : lang === "ru"
                    ? "Мы свяжемся с вами в ближайшее время."
                    : "We will contact you shortly. Thank you!"}
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
              >
                {lang === "uz" ? "Yana xabar yuborish" : lang === "ru" ? "Отправить ещё" : "Send another"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.contact.your_name}</label>
                  <input
                    {...register("name")}
                    autoComplete="name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Ali Valiyev"
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.contact.phone_number}</label>
                  <input
                    {...register("phone")}
                    autoComplete="tel"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="+998 __ ___ __ __"
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === "uz" ? "Email (ixtiyoriy)" : lang === "ru" ? "Email (необязательно)" : "Email (optional)"}
                </label>
                <input
                  {...register("email")}
                  autoComplete="email"
                  type="email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="ali@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.contact.message_opt}</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  placeholder={t.contact.message_placeholder}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-700 text-white font-display font-bold uppercase tracking-widest py-4 rounded-xl shadow-md hover:bg-blue-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={22} /> : t.common.send}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
