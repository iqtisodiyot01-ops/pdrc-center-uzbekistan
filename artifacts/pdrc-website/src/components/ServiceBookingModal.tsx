import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, User, Phone, MessageSquare, CheckCircle2, Send, Loader2, HeadphonesIcon } from "lucide-react";
import { useAppStore } from "@/store/use-store";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: number;
  nameUz: string;
  nameEn: string;
  nameRu: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
}

const MANAGER_PHONE = "+998905783272";
const MANAGER_PHONE2 = "+998974026565";

export function ServiceBookingModal({ open, onClose, service }: Props) {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const getServiceName = (s: Service) => lang === "uz" ? s.nameUz : lang === "ru" ? s.nameRu : s.nameEn;

  const book = useMutation({
    mutationFn: () =>
      api.post("/bookings", {
        type: "service_booking",
        name: form.name,
        phone: form.phone,
        serviceId: service?.id ?? null,
        message: (service ? `Xizmat: ${getServiceName(service)}. ` : "") + (form.message || ""),
      }),
    onSuccess: () => setSuccess(true),
    onError: () => toast({ title: lang === "uz" ? "Xatolik yuz berdi" : lang === "ru" ? "Произошла ошибка" : "An error occurred", variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast({
        title: lang === "uz" ? "Ism va telefon raqamini kiriting" : lang === "ru" ? "Введите имя и номер телефона" : "Enter name and phone",
        variant: "destructive",
      });
      return;
    }
    book.mutate();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSuccess(false); setForm({ name: "", phone: "", message: "" }); }, 300);
  };

  const t = {
    uz: {
      title: "Xizmatni bron qilish", for: "Xizmat:",
      name: "To'liq ism *", phone: "Telefon raqam *", msg: "Qo'shimcha xabar",
      send: "Bronlash", cancel: "Bekor qilish",
      callManager: "Menejerga bog'lanish",
      successTitle: "Broningiz qabul qilindi!",
      successDesc: "Yaqin orada menejer siz bilan bog'lanadi.",
      call: "Qo'ng'iroq qilish", close: "Yopish",
      namePh: "Ism va familiya", phonePh: "+998 XX XXX XX XX", msgPh: "Savollaringiz bo'lsa...",
    },
    ru: {
      title: "Забронировать услугу", for: "Услуга:",
      name: "Полное имя *", phone: "Номер телефона *", msg: "Дополнительное сообщение",
      send: "Забронировать", cancel: "Отмена",
      callManager: "Связаться с менеджером",
      successTitle: "Бронь принята!",
      successDesc: "Менеджер свяжется с вами в ближайшее время.",
      call: "Позвонить", close: "Закрыть",
      namePh: "Имя и фамилия", phonePh: "+998 XX XXX XX XX", msgPh: "Если есть вопросы...",
    },
    en: {
      title: "Book Service", for: "Service:",
      name: "Full name *", phone: "Phone number *", msg: "Additional message",
      send: "Book now", cancel: "Cancel",
      callManager: "Contact manager",
      successTitle: "Booking received!",
      successDesc: "A manager will contact you shortly.",
      call: "Call", close: "Close",
      namePh: "Full name", phonePh: "+998 XX XXX XX XX", msgPh: "Any questions...",
    },
  }[lang as "uz" | "ru" | "en"] ?? {
    title: "Book", for: "Service:", name: "Name *", phone: "Phone *", msg: "Message",
    send: "Book", cancel: "Cancel", callManager: "Call manager",
    successTitle: "Booked!", successDesc: "We'll contact you.", call: "Call", close: "Close",
    namePh: "Name", phonePh: "+998...", msgPh: "Message...",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed inset-0 z-[301] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0f3460] to-blue-700 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Wrench size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">{t.title}</h2>
                    {service && (
                      <p className="text-blue-200 text-xs mt-0.5 line-clamp-1">
                        {getServiceName(service)}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={handleClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Manager call banner */}
              <div className="flex gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                <a
                  href={`tel:${MANAGER_PHONE}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#0f3460] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <HeadphonesIcon size={13} />
                  {t.callManager}
                </a>
                <a
                  href={`tel:${MANAGER_PHONE2}`}
                  className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Phone size={13} />
                </a>
              </div>

              <div className="p-5">
                {success ? (
                  <div className="flex flex-col items-center text-center py-4 gap-4">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 size={32} className="text-green-500" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{t.successTitle}</h3>
                      <p className="text-gray-500 text-sm">{t.successDesc}</p>
                    </div>
                    <div className="w-full flex gap-2">
                      <a href={`tel:${MANAGER_PHONE}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0f3460] text-white font-bold rounded-xl text-sm hover:bg-blue-800">
                        <Phone size={14} /> {t.call}
                      </a>
                      <button onClick={handleClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
                        {t.close}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                        <User size={12} className="text-blue-600" />{t.name}
                      </label>
                      <input
                        type="text" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t.namePh}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                        <Phone size={12} className="text-blue-600" />{t.phone}
                      </label>
                      <input
                        type="tel" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder={t.phonePh}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                        <MessageSquare size={12} className="text-blue-600" />{t.msg}
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={2}
                        placeholder={t.msgPh}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button onClick={handleClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        {t.cancel}
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={book.isPending}
                        className="flex-1 py-2.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-1.5"
                      >
                        {book.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                        {t.send}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
