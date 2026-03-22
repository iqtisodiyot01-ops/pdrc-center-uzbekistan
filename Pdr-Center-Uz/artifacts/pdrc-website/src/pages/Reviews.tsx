import { useTranslation } from "@/lib/i18n";
import { useGetReviews, getGetReviewsQueryKey } from "@workspace/api-client-react";
import type { Review } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { Loader2, Star, Quote, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Reviews() {
  const { t, loc } = useTranslation();
  const { token } = useAppStore();

  const { data: reviews, isLoading } = useGetReviews({
    query: { enabled: !!token, queryKey: getGetReviewsQueryKey() },
    request: { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full pb-24 bg-gray-50">
      <div className="bg-[#0f3460] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="section-badge-dark mx-auto">PDR Center Uzbekistan</div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight mb-4">
            {t.reviews.heading} <span className="text-blue-300">{t.reviews.highlight}</span>
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t.reviews.desc}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews?.map((review: Review, idx: number) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              key={review.id}
              className="bg-white p-7 rounded-2xl border border-gray-200 relative hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <Quote className="absolute top-6 right-6 text-blue-50 w-12 h-12 rotate-180" />

              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                ))}
              </div>

              <p className="text-gray-600 text-base leading-relaxed mb-7 relative z-10 italic">
                "{loc(review, "text")}"
              </p>

              <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center font-display font-bold text-blue-700 overflow-hidden border border-blue-100 shrink-0 text-lg">
                  {review.avatarUrl
                    ? <img src={review.avatarUrl} alt={review.author} className="w-full h-full object-cover" />
                    : review.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{review.author}</h4>
                  <p className="text-xs text-blue-600 font-bold tracking-wider uppercase mt-0.5">{review.carBrand}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {(!reviews || reviews.length === 0) && (
            <div className="col-span-full py-24 flex flex-col items-center gap-4 text-gray-400">
              <MessageSquare size={48} className="text-gray-300" />
              <p className="font-display text-xl uppercase">{t.reviews.no_reviews}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
