import { useTranslation } from "@/lib/i18n";
import { useGetCourses, getGetCoursesQueryKey } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { Loader2, GraduationCap, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Courses() {
  const { t, loc } = useTranslation();
  const { token } = useAppStore();

  const { data: courses, isLoading } = useGetCourses({
    query: { enabled: !!token, queryKey: getGetCoursesQueryKey() },
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
            {t.courses.heading} <span className="text-blue-300">{t.nav.courses}</span>
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t.courses.desc}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-12 space-y-6">
        {courses?.map((course, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={course.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row group hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="md:w-64 lg:w-72 bg-gradient-to-br from-[#0f3460] to-[#1a4f8a] p-8 flex items-center justify-center relative overflow-hidden shrink-0">
              {course.imageUrl ? (
                <img src={course.imageUrl} alt="Course" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
              ) : null}
              <GraduationCap className="text-blue-200 w-20 h-20 relative z-10" />
            </div>

            <div className="p-8 md:p-10 flex-1 flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-200">
                  {course.level}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <Clock size={14} className="text-blue-500" /> {course.durationDays} {t.courses.days}
                </span>
              </div>

              <h3 className="text-2xl font-heading font-bold text-[#0f3460] mb-4 leading-tight">{loc(course, "name")}</h3>
              <p className="text-gray-600 text-sm leading-loose mb-8 flex-1">
                {loc(course, "description")}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mt-auto pt-6 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">{t.common.price}</p>
                  <p className="font-heading font-extrabold text-2xl text-[#0f3460]">{course.price.toLocaleString()} UZS</p>
                </div>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 text-white font-display font-bold uppercase tracking-widest rounded-xl hover:bg-blue-800 transition-colors text-center flex items-center justify-center gap-2"
                >
                  {t.courses.enroll} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        {(!courses || courses.length === 0) && (
          <div className="text-center py-24 text-gray-400 font-display text-xl uppercase">
            {t.courses.heading}
          </div>
        )}
      </div>
    </div>
  );
}
