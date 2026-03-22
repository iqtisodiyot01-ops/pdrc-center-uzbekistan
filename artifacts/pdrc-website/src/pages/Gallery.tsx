import { useTranslation } from "@/lib/i18n";
import { useGetGallery, getGetGalleryQueryKey } from "@workspace/api-client-react";
import type { GalleryItem } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { Loader2, Images } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Gallery() {
  const { t, loc } = useTranslation();
  const { token } = useAppStore();
  const [filter, setFilter] = useState<string>("all");

  const { data: gallery, isLoading } = useGetGallery(undefined, {
    query: { enabled: !!token, queryKey: getGetGalleryQueryKey() },
    request: { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const filteredGallery = filter === "all" ? gallery : gallery?.filter((g: GalleryItem) => g.category === filter);
  const categories = ["all", "dent", "hail", "scratch"];

  return (
    <div className="w-full pb-24 bg-gray-50">
      <div className="bg-[#0f3460] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="section-badge-dark mx-auto">PDR Center Uzbekistan</div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight mb-4">
            {t.gallery.heading} <span className="text-blue-300">{t.gallery.highlight}</span>
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.gallery.desc}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all ${
                  filter === cat
                    ? "bg-white text-[#0f3460]"
                    : "bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white"
                }`}
              >
                {cat === "all" ? t.gallery.all : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGallery?.map((item: GalleryItem, idx: number) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="flex h-64 md:h-72">
                <div className="w-1/2 relative border-r border-gray-100 group overflow-hidden">
                  <img
                    src={item.beforeImage.startsWith("http") ? item.beforeImage : "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800&auto=format&fit=crop"}
                    alt={t.gallery.before}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full">
                    {t.gallery.before}
                  </div>
                </div>
                <div className="w-1/2 relative group overflow-hidden">
                  <img
                    src={item.afterImage.startsWith("http") ? item.afterImage : "https://images.unsplash.com/photo-1611018501170-07e77b6d1912?w=800&auto=format&fit=crop"}
                    alt={t.gallery.after}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full">
                    {t.gallery.after}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{loc(item, "title")}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">{item.carBrand ?? "—"}</p>
                  </div>
                  <span className="text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                    {item.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {(!filteredGallery || filteredGallery.length === 0) && (
            <div className="col-span-full py-24 flex flex-col items-center gap-4 text-gray-400">
              <Images size={48} className="text-gray-300" />
              <p className="font-display text-xl uppercase">{t.gallery.no_items}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
