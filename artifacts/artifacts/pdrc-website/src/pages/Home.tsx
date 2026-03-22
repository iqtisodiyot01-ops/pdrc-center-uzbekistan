import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Wrench, Award, ChevronRight, CheckCircle2, Phone, Send } from "lucide-react";
import { useGetServices, getGetServicesQueryKey } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";

export default function Home() {
  const { t, loc } = useTranslation();
  const { token } = useAppStore();

  const { data: services } = useGetServices({
    query: { enabled: !!token, queryKey: getGetServicesQueryKey() },
    request: { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  });

  return (
    <div className="w-full">

      {/* ── Hero Section ── */}
      <section className="relative bg-[#0a2748] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-workshop.png`}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2748]/95 via-[#0a2748]/70 to-[#0f3460]/50" />
        </div>

        {/* Main hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center md:text-left py-12 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto md:mx-0"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 mb-5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
              <Award size={14} /> {t.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-extrabold text-white mb-5 leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                PAINTLESS
              </span><br />
              DENT REPAIR
            </h1>

            <p className="text-base md:text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/contact"
                className="px-6 py-3.5 md:px-8 md:py-4 bg-white text-[#0f3460] font-display font-bold uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {t.hero.cta} <ChevronRight size={18} />
              </Link>
              <Link
                href="/services"
                className="px-6 py-3.5 md:px-8 md:py-4 bg-white/10 text-white font-display font-bold uppercase tracking-widest rounded-xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center text-sm"
              >
                {t.nav.services}
              </Link>
            </div>

            {/* Quick contact — hidden on mobile (already in header row 2) */}
            <div className="hidden sm:flex flex-wrap gap-4 mt-7 justify-center md:justify-start">
              <a href="tel:+998905783272" className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors">
                <Phone size={14} /> +998 90 578 32 72
              </a>
              <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors">
                <Send size={14} /> @pdrtoolls
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats Strip — always horizontal (3-col), part of flow, no absolute */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-0 divide-x divide-white/10">
            <div className="flex items-center justify-center gap-2 py-4">
              <CheckCircle2 size={18} className="text-blue-300 shrink-0" />
              <div className="font-heading font-bold text-[10px] sm:text-sm text-white leading-tight">{t.hero.stats_years}</div>
            </div>
            <div className="flex items-center justify-center gap-2 py-4">
              <CheckCircle2 size={18} className="text-blue-300 shrink-0" />
              <div className="font-heading font-bold text-[10px] sm:text-sm text-white leading-tight">{t.hero.stats_cars}</div>
            </div>
            <div className="flex items-center justify-center gap-2 py-4">
              <CheckCircle2 size={18} className="text-blue-300 shrink-0" />
              <div className="font-heading font-bold text-[10px] sm:text-sm text-white leading-tight">{t.hero.stats_courses}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Services ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14">
            <div>
              <div className="section-badge-light">PDR Center Uzbekistan</div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0f3460] leading-tight mb-3">
                {t.home.services_title} <span className="text-blue-600">{t.home.services_highlight}</span>
              </h2>
              <p className="text-gray-600 max-w-2xl text-base leading-relaxed">
                {t.home.services_desc}
              </p>
            </div>
            <Link href="/services" className="mt-6 md:mt-0 text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-2 font-semibold text-sm">
              {t.home.services_all} <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services?.slice(0, 3).map((svc) => (
              <div
                key={svc.id}
                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-700 group-hover:text-white transition-all">
                  <Wrench size={26} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{loc(svc, "name")}</h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed">{loc(svc, "description")}</p>
                <div className="font-heading text-blue-700 font-bold text-base">
                  {svc.price ? `${svc.price.toLocaleString()} UZS` : t.home.custom_price}
                </div>
              </div>
            ))}
            {(!services || services.length === 0) && (
              <div className="col-span-3 text-center py-12 text-gray-400">{t.home.no_services}</div>
            )}
          </div>
        </div>
      </section>

      {/* ── Catalog Categories Banner ── */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="section-badge-light mx-auto">PDR Center Uzbekistan</div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">
              PDR <span className="text-blue-600">Katalog</span>
            </h2>
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">Professional PDR asboblar va jihozlar</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Tayyor to'plamlar", icon: "🎁" },
              { label: "Kanchallar", icon: "🔧" },
              { label: "Aksessuarlar", icon: "🛠️" },
              { label: "Lampalar", icon: "💡" },
              { label: "Yelim tizimi", icon: "🔩" },
              { label: "Ijtimoiy shartnoma", icon: "📋" },
            ].map((cat) => (
              <Link
                key={cat.label}
                href="/shop"
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition-colors leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After Banner ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0f3460] rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-xl">
            <div className="p-10 lg:w-1/2 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-5 leading-tight">
                {t.home.diff_title} <span className="text-blue-300">{t.home.diff_highlight}</span>
              </h2>
              <p className="text-blue-100 mb-8 text-base leading-loose">
                {t.home.diff_desc}
              </p>
              <Link href="/gallery" className="w-fit px-8 py-4 bg-white text-[#0f3460] font-display font-bold uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-colors">
                {t.home.diff_cta}
              </Link>
            </div>
            <div className="lg:w-1/2 relative min-h-[360px]">
              <img
                src={`${import.meta.env.BASE_URL}images/dent-before-after.png`}
                alt="Before and After Dent Repair"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4 leading-tight">
            {typeof t.nav.contact === "string" ? t.nav.contact.toUpperCase() : "BOG'LANISH"}
          </h2>
          <p className="text-blue-100 mb-8 text-lg">+998 90 578 32 72 · +998 97 402 65 65</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+998905783272"
              className="px-8 py-4 bg-white text-blue-700 font-display font-bold uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={18} /> {t.hero.cta}
            </a>
            <a
              href="https://t.me/pdrtoolls"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-white/10 text-white border border-white/20 font-display font-bold uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} /> Telegram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
