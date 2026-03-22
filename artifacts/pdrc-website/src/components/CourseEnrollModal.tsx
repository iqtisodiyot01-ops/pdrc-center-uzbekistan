import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap, User, Phone, MapPin, Calendar, MessageSquare, CheckCircle2, Send, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/use-store";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  nameUz: string;
  nameEn: string;
  nameRu: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  preselectedCourse?: Course | null;
}

const MANAGER_PHONE = "+998905783272";

export function CourseEnrollModal({ open, onClose, courses, preselectedCourse }: Props) {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    address: "",
    courseName: preselectedCourse ? (lang === "uz" ? preselectedCourse.nameUz : lang === "ru" ? preselectedCourse.nameRu : preselectedCourse.nameEn) : "",
    message: "",
  });

  const getCourseName = (c: Course) => lang === "uz" ? c.nameUz : lang === "ru" ? c.nameRu : c.nameEn;

  const enroll = useMutation({
    mutationFn: () =>
      api.post("/bookings", {
        type: "course_enrollment",
        name: form.name,
        phone: form.phone,
        age: form.age || null,
        address: form.address || null,
        courseName: form.courseName || null,
        message: form.message || null,
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
    enroll.mutate();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSuccess(false); setForm({ name: "", phone: "", age: "", address: "", courseName: preselectedCourse ? getCourseName(preselectedCourse) : "", message: "" }); }, 300);
  };

  const t = {
    uz: {
      title: "Kursga yozilish", name: "To'liq ism *", phone: "Telefon raqam *",
      age: "Yosh", address: "Manzil", course: "Kursni tanlang", msg: "Qo'shimcha xabar",
      send: "Yuborish", cancel: "Bekor qilish",
      successTitle: "Arizangiz qabul qilindi!",
      successDesc: "Tez orada siz bilan bog'lanamiz. Savolingiz bo'lsa, qo'ng'iroq qiling.",
      call: "Menejerga qo'ng'iroq", close: "Yopish",
      namePh: "Ism va familiya", phonePh: "+998 XX XXX XX XX", agePh: "25", addrPh: "Shahar, tuman...", msgPh: "Qo'shimcha ma'lumot...",
    },
    ru: {
      title: "Записаться на курс", name: "Полное имя *", phone: "Номер телефона *",
      age: "Возраст", address: "Адрес", course: "Выберите курс", msg: "Дополнительное сообщение",
      send: "Отправить", cancel: "Отмена",
      successTitle: "Заявка принята!",
      successDesc: "Мы свяжемся с вами в ближайшее время. Если есть вопросы — позвоните.",
      call: "Позвонить менеджеру", close: "Закрыть",
      namePh: "Имя и фамилия", phonePh: "+998 XX XXX XX XX", agePh: "25", addrPh: "Город, район...", msgPh: "Дополнительная информация...",
    },
    en: {
      title: "Enroll in Course", name: "Full name *", phone: "Phone number *",
      age: "Age", address: "Address", course: "Select course", msg: "Additional message",
      send: "Submit", cancel: "Cancel",
      successTitle: "Application received!",
      successDesc: "We will contact you shortly. Feel free to call if you have questions.",
      call: "Call manager", close: "Close",
      namePh: "Full name", phonePh: "+998 XX XXX XX XX", agePh: "25", addrPh: "City, district...", msgPh: "Additional info...",
    },
  }[lang as "uz" | "ru" | "en"] ?? {
    title: "Enroll", name: "Name *", phone: "Phone *", age: "Age", address: "Address",
    course: "Select course", msg: "Message", send: "Submit", cancel: "Cancel",
    successTitle: "Done!", successDesc: "We'll contact you soon.", call: "Call manager", close: "Close",
    namePh: "Full name", phonePh: "+998...", agePh: "25", addrPh: "City...", msgPh: "Message...",
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0f3460] to-blue-700 px-6 py-5 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <GraduationCap size={20} className="text-white" />
                  </div>
                  <h2 className="text-white font-bold text-lg">{t.title}</h2>
                </div>
                <button onClick={handleClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                {success ? (
                  /* Success state */
                  <div className="flex flex-col items-center text-center py-4 gap-4">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 size={40} className="text-green-500" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{t.successDesc}</p>
                    </div>
                    <div className="w-full flex flex-col gap-2 mt-2">
                      <a
                        href={`tel:${MANAGER_PHONE}`}
                        className="flex items-center justify-center gap-2 py-3 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors"
                      >
                        <Phone size={16} />
                        {t.call}
                      </a>
                      <button onClick={handleClose} className="py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors underline">
                        {t.close}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form */
                  <div className="flex flex-col gap-4">
                    {/* Name */}
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

                    {/* Phone */}
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

                    {/* Age + Address row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          <Calendar size={12} className="text-blue-600" />{t.age}
                        </label>
                        <input
                          type="number" value={form.age}
                          onChange={(e) => setForm({ ...form, age: e.target.value })}
                          placeholder={t.agePh}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          <MapPin size={12} className="text-blue-600" />{t.address}
                        </label>
                        <input
                          type="text" value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder={t.addrPh}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>

                    {/* Course select */}
                    {courses.length > 0 && (
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          <GraduationCap size={12} className="text-blue-600" />{t.course}
                        </label>
                        <select
                          value={form.courseName}
                          onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                        >
                          <option value="">{t.course}</option>
                          {courses.map((c) => (
                            <option key={c.id} value={getCourseName(c)}>{getCourseName(c)}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                        <MessageSquare size={12} className="text-blue-600" />{t.msg}
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={3}
                        placeholder={t.msgPh}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-1">
                      <button onClick={handleClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        {t.cancel}
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={enroll.isPending}
                        className="flex-1 py-2.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                      >
                        {enroll.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
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
