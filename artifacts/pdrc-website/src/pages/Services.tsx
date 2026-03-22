import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useGetServices, getGetServicesQueryKey } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { Loader2, Zap, ChevronRight, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { ServiceBookingModal } from "@/components/ServiceBookingModal";

const MANAGER_PHONE = "+998905783272";

interface Service {
  id: number;
  nameUz: string;
  nameEn: string;
  nameRu: string;
  category?: string | null;
  price?: number | null;
  imageUrl?: string | null;
}

export default function Services() {
  const { t, loc } = useTranslation();
  const { lang, token } = useAppStore();
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { data: services, isLoading } = useGetServices({
    query: { enabled: !!token, queryKey: getGetServicesQueryKey() },
    request: { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const handleBook = (svc: Service) => {
    setSelectedService(svc);
    setBookingModal(true);
  };

  const managerLabel = lang === "uz" ? "Menejerga bog'lanish" : lang === "ru" ? "Связаться с менеджером" : "Contact manager";

  return (
    <div className="w-full pb-24 bg-gray-50">
      <div className="bg-[#0f3460] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="section-badge-dark mx-auto">PDR Center Uzbekistan</div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight mb-4">
            {t.services.heading} <span className="text-blue-300">{t.nav.services}</span>
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t.services.desc}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((svc, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              key={svc.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {svc.imageUrl ? (
                <div className="h-48 w-full overflow-hidden relative">
                  <img src={svc.imageUrl} alt={loc(svc, "name")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <Zap className="text-blue-200 w-20 h-20" />
                </div>
              )}

              <div className="p-7 flex-1 flex flex-col">
                <div className="uppercase tracking-widest text-xs font-bold text-blue-600 mb-3">
                  {svc.category || t.services.category}
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 leading-snug">{loc(svc, "name")}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-1 leading-loose">
                  {loc(svc, "description")}
                </p>

                <div className="flex flex-col gap-3 mt-auto pt-5 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="font-heading font-extrabold text-lg text-[#0f3460]">
                      {svc.price ? `${svc.price.toLocaleString()} UZS` : t.services.custom_price}
                    </div>
                    <button
                      onClick={() => handleBook(svc as Service)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                    >
                      {t.common.book_now} <ChevronRight size={14} />
                    </button>
                  </div>
                  <a
                    href={`tel:${MANAGER_PHONE}`}
                    className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                  >
                    <Phone size={14} />
                    {managerLabel}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
          {(!services || services.length === 0) && (
            <div className="col-span-3 text-center py-24 text-gray-400 font-display text-xl uppercase">
              {t.home.no_services}
            </div>
          )}
        </div>
      </div>

      <ServiceBookingModal
        open={bookingModal}
        onClose={() => setBookingModal(false)}
        service={selectedService}
      />
    </div>
  );
}
