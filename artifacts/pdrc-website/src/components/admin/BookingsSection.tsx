import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, GraduationCap, Wrench, Phone, MapPin, Calendar, MessageSquare } from "lucide-react";

interface Booking {
  id: number;
  type: string;
  name: string;
  phone: string;
  email: string | null;
  age: string | null;
  address: string | null;
  serviceId: number | null;
  courseName: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border border-amber-200",
  completed: "bg-green-100 text-green-700 border border-green-200",
  cancelled: "bg-red-100 text-red-700 border border-red-200",
};

const STATUS_LABELS = {
  uz: { new: "Yangi", in_progress: "Jarayonda", completed: "Bajarildi", cancelled: "Bekor" },
  ru: { new: "Новый", in_progress: "В процессе", completed: "Выполнен", cancelled: "Отменён" },
  en: { new: "New", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" },
};

export function BookingsSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: () => api.get<Booking[]>("/bookings"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.put(`/bookings/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast({ title: lang === "uz" ? "Yangilandi" : lang === "ru" ? "Обновлено" : "Updated" }); },
  });

  const deleteBooking = useMutation({
    mutationFn: (id: number) => api.delete(`/bookings/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast({ title: lang === "uz" ? "O'chirildi" : lang === "ru" ? "Удалено" : "Deleted" }); },
  });

  const statusLabels = STATUS_LABELS[lang as "uz" | "ru" | "en"] || STATUS_LABELS.en;

  const isCourse = (b: Booking) => b.type === "course_enrollment";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Bronlar va Ro'yxatdan o'tishlar" : lang === "ru" ? "Брони и Записи" : "Bookings & Enrollments"}
        </h1>
        {bookings && bookings.length > 0 && (
          <div className="flex gap-2 text-xs">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold border border-blue-100">
              {lang === "uz" ? "Jami" : lang === "ru" ? "Всего" : "Total"}: {bookings.length}
            </span>
            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full font-semibold border border-orange-100">
              {lang === "uz" ? "Yangi" : lang === "ru" ? "Новых" : "New"}: {bookings.filter((b) => b.status === "new").length}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <p className="text-gray-400 text-sm">{lang === "uz" ? "Bronlar yo'q" : lang === "ru" ? "Нет броней" : "No bookings yet"}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <div key={b.id} className={`bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md ${b.status === "new" ? "border-blue-200" : "border-gray-200"}`}>
              {/* Card header */}
              <div className={`px-5 py-3.5 flex items-center justify-between border-b ${isCourse(b) ? "bg-purple-50 border-purple-100" : "bg-blue-50 border-blue-100"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCourse(b) ? "bg-purple-100" : "bg-blue-100"}`}>
                    {isCourse(b)
                      ? <GraduationCap size={14} className="text-purple-600" />
                      : <Wrench size={14} className="text-blue-600" />
                    }
                  </div>
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${isCourse(b) ? "text-purple-700" : "text-blue-700"}`}>
                      {isCourse(b)
                        ? (lang === "uz" ? "Kurs ro'yxatdan o'tish" : lang === "ru" ? "Запись на курс" : "Course enrollment")
                        : (lang === "uz" ? "Xizmat bron" : lang === "ru" ? "Бронь услуги" : "Service booking")
                      }
                    </span>
                    {b.courseName && (
                      <p className="text-xs text-purple-600 font-medium">📚 {b.courseName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabels[b.status as keyof typeof statusLabels] || b.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()} {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {/* Name */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{lang === "uz" ? "Ism" : lang === "ru" ? "Имя" : "Name"}</p>
                    <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5 flex items-center gap-1"><Phone size={10} />{lang === "uz" ? "Telefon" : lang === "ru" ? "Телефон" : "Phone"}</p>
                    <a href={`tel:${b.phone}`} className="text-sm font-semibold text-blue-600 hover:underline font-mono">{b.phone}</a>
                  </div>

                  {/* Age (if exists) */}
                  {b.age && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5 flex items-center gap-1"><Calendar size={10} />{lang === "uz" ? "Yoshi" : lang === "ru" ? "Возраст" : "Age"}</p>
                      <p className="text-sm font-semibold text-gray-900">{b.age}</p>
                    </div>
                  )}

                  {/* Address (if exists) */}
                  {b.address && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5 flex items-center gap-1"><MapPin size={10} />{lang === "uz" ? "Manzil" : lang === "ru" ? "Адрес" : "Address"}</p>
                      <p className="text-sm text-gray-700">{b.address}</p>
                    </div>
                  )}

                  {/* Message (if exists) */}
                  {b.message && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5 flex items-center gap-1"><MessageSquare size={10} />{lang === "uz" ? "Xabar" : lang === "ru" ? "Сообщение" : "Message"}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{b.message}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus.mutate({ id: b.id, status: e.target.value })}
                    disabled={updateStatus.isPending}
                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white font-medium text-gray-700 cursor-pointer"
                  >
                    <option value="new">{statusLabels.new}</option>
                    <option value="in_progress">{statusLabels.in_progress}</option>
                    <option value="completed">{statusLabels.completed}</option>
                    <option value="cancelled">{statusLabels.cancelled}</option>
                  </select>
                  <div className="flex gap-2">
                    <a href={`tel:${b.phone}`} className="px-3 py-1.5 bg-[#0f3460] text-white text-xs font-bold rounded-lg hover:bg-blue-800 flex items-center gap-1.5 transition-colors">
                      <Phone size={11} />
                      {lang === "uz" ? "Qo'ng'iroq" : lang === "ru" ? "Позвонить" : "Call"}
                    </a>
                    <button
                      onClick={() => deleteBooking.mutate(b.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
