import { useTranslation } from "@/lib/i18n";
import { useCreateBooking } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Phone, MapPin, Mail, Instagram, Send, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Contact() {
  const { t } = useTranslation();
  const { token } = useAppStore();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useCreateBooking({
    request: { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    mutation: {
      onSuccess: () => {
        toast({ title: t.contact.success, description: t.contact.success_desc });
        reset();
      },
      onError: () => {
        toast({ variant: "destructive", title: t.contact.error, description: t.contact.error_desc });
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ data });
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

        {/* Booking Form */}
        <div className="lg:w-2/3 bg-white p-8 md:p-10 rounded-2xl border border-gray-200">
          <h2 className="text-2xl font-heading font-bold text-[#0f3460] mb-2 leading-snug">{t.contact.form_title}</h2>
          <p className="text-gray-500 mb-8 text-sm">{t.contact.form_desc}</p>

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
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.contact.message_opt}</label>
              <textarea
                {...register("message")}
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                placeholder={t.contact.message_placeholder}
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-700 text-white font-display font-bold uppercase tracking-widest py-4 rounded-xl shadow-md hover:bg-blue-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" size={22} /> : t.common.send}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
