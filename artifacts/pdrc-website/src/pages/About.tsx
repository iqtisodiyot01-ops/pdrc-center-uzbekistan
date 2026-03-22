import { useAppStore } from "@/store/use-store";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Award, CheckCircle2, Users, Wrench, GraduationCap,
  ShieldCheck, Phone, Send, Star, MapPin
} from "lucide-react";

export default function About() {
  const { lang } = useAppStore();

  const t = {
    uz: {
      hero_label: "PDR Center Uzbekistan",
      hero_title: "Biz haqimizda",
      hero_sub: "O'zbekistonda №1 PDR markazi — professional ta'lim va asboblar",
      badge: "O'zbekistonda №1",
      story_title: "Bizning tariximiz",
      story_body:
        "PDR Center Uzbekistan 2014-yilda Toshkentda tashkil etilgan. Biz bo'yoqsiz g'ijimlash tuzatish (PDR) sohasidagi professional ta'lim va yuqori sifatli asbob-uskunalar yetkazib berish bo'yicha O'zbekistondagi yetakchi markazga aylandik. Bizning maqsadimiz — har bir mijozga va kurschi o'quvchiga eng yuqori sifatdagi xizmat ko'rsatish.",
      mission_title: "Bizning missiyamiz",
      mission_body:
        "Avtomobil egalarini arzon, tez va kafolatlangan yo'l bilan g'ijimlash muammosidan xalos etish. Professional PDR texniklarni tayyorlash va ularni mukammal asbob-uskunalar bilan ta'minlash.",
      stats: [
        { value: "10+", label: "Yil tajriba" },
        { value: "1000+", label: "Ta'mirlangan avto" },
        { value: "50+", label: "Kurs bitiruvchilari" },
        { value: "100%", label: "Kafolat" },
      ],
      services_title: "Bizning xizmatlarimiz",
      services: [
        {
          icon: GraduationCap,
          title: "PDR Kurslar",
          desc: "Boshlang'ich va professional darajadagi PDR ta'lim kurslari. Amaliy mashg'ulotlar va sertifikat.",
        },
        {
          icon: Wrench,
          title: "PDR Asboblar do'koni",
          desc: "Professional PDR kanchallar, tayoqchalar, lampalar, yelim tizimlari va tayyor to'plamlar.",
        },
        {
          icon: ShieldCheck,
          title: "Ijtimoiy shartnoma",
          desc: "Davlat dasturi bo'yicha preferensial shartlarda to'plamlarni sotib olish va kurs o'tish imkoniyati.",
        },
        {
          icon: Award,
          title: "Sertifikatsiya",
          desc: "Kurs yakunida xalqaro standartlarga mos sertifikat berilib, professional PDR texnik unvoni beriladi.",
        },
      ],
      why_title: "Nima uchun biz?",
      why: [
        "O'zbekistonda 10 yildan ortiq tajriba",
        "Sertifikatlangan xalqaro standartlar",
        "Real amaliy mashg'ulotlar",
        "Kursdan keyin ish bilan ta'minlash yordami",
        "Barcha darajalar uchun kurslar",
        "Yuqori sifatli professional asboblar",
        "3 tilda xizmat ko'rsatish (UZ/EN/RU)",
        "Toshkentda joylashgan, butun O'zbekistonga yetkazib berish",
      ],
      team_title: "Bizning jamoamiz",
      team: [
        { name: "Bobur Raximov", role: "Bosh instruktor · PDR Master", stars: 5 },
        { name: "Timur Eshmatov", role: "Senior PDR texnik", stars: 5 },
        { name: "Nilufar Karimova", role: "Savdo menejeri", stars: 5 },
      ],
      location: "Manzil: Toshkent, O'zbekiston",
      cta_title: "Biz bilan bog'laning",
      cta_desc: "Savollaringiz bormi? Bizga qo'ng'iroq qiling yoki Telegram orqali yozing.",
      cta_btn: "Aloqaga chiqish",
    },
    ru: {
      hero_label: "PDR Center Uzbekistan",
      hero_title: "О нас",
      hero_sub: "Центр №1 в Узбекистане — профессиональное обучение и инструменты PDR",
      badge: "№1 в Узбекистане",
      story_title: "Наша история",
      story_body:
        "PDR Center Uzbekistan основан в 2014 году в Ташкенте. За это время мы стали ведущим центром в Узбекистане по профессиональному обучению технологии PDR и поставке высококачественного оборудования. Наша цель — обеспечить каждого клиента и студента обучения максимально качественным сервисом.",
      mission_title: "Наша миссия",
      mission_body:
        "Помочь владельцам автомобилей решить проблему вмятин быстро, недорого и с гарантией. Подготовить профессиональных PDR-мастеров и обеспечить их лучшим инструментом.",
      stats: [
        { value: "10+", label: "Лет опыта" },
        { value: "1000+", label: "Автомобилей" },
        { value: "50+", label: "Выпускников" },
        { value: "100%", label: "Гарантия" },
      ],
      services_title: "Наши услуги",
      services: [
        {
          icon: GraduationCap,
          title: "Курсы PDR",
          desc: "Учебные курсы начального и профессионального уровня. Практика и сертификат.",
        },
        {
          icon: Wrench,
          title: "Магазин PDR-инструментов",
          desc: "Профессиональные крючки, лампы, клеевые системы и готовые наборы.",
        },
        {
          icon: ShieldCheck,
          title: "Социальный пакет",
          desc: "Покупка наборов и прохождение курсов по государственной программе на льготных условиях.",
        },
        {
          icon: Award,
          title: "Сертификация",
          desc: "По окончании курса выдаётся сертификат международного стандарта PDR-мастера.",
        },
      ],
      why_title: "Почему мы?",
      why: [
        "Более 10 лет опыта в Узбекистане",
        "Международные стандарты сертификации",
        "Реальные практические занятия",
        "Помощь в трудоустройстве после курса",
        "Курсы для всех уровней",
        "Высококачественные профессиональные инструменты",
        "Обслуживание на 3 языках (UZ/EN/RU)",
        "Офис в Ташкенте, доставка по всему Узбекистану",
      ],
      team_title: "Наша команда",
      team: [
        { name: "Бобур Рахимов", role: "Главный инструктор · PDR Мастер", stars: 5 },
        { name: "Тимур Эшматов", role: "Старший PDR-техник", stars: 5 },
        { name: "Нилуфар Каримова", role: "Менеджер по продажам", stars: 5 },
      ],
      location: "Адрес: Ташкент, Узбекистан",
      cta_title: "Свяжитесь с нами",
      cta_desc: "Есть вопросы? Позвоните нам или напишите в Telegram.",
      cta_btn: "Связаться",
    },
    en: {
      hero_label: "PDR Center Uzbekistan",
      hero_title: "About Us",
      hero_sub: "Uzbekistan's #1 PDR center — professional training and premium tools",
      badge: "#1 in Uzbekistan",
      story_title: "Our Story",
      story_body:
        "PDR Center Uzbekistan was founded in 2014 in Tashkent. We have grown to become Uzbekistan's leading center for professional Paintless Dent Repair training and high-quality equipment supply. Our goal is to provide every client and student with the highest quality service.",
      mission_title: "Our Mission",
      mission_body:
        "Help car owners solve dent problems quickly, affordably, and with guaranteed results. Train professional PDR technicians and equip them with the best tools on the market.",
      stats: [
        { value: "10+", label: "Years Experience" },
        { value: "1000+", label: "Cars Fixed" },
        { value: "50+", label: "Certified Graduates" },
        { value: "100%", label: "Guarantee" },
      ],
      services_title: "Our Services",
      services: [
        {
          icon: GraduationCap,
          title: "PDR Courses",
          desc: "Beginner and professional PDR training. Hands-on practice and certification.",
        },
        {
          icon: Wrench,
          title: "PDR Tools Shop",
          desc: "Professional hooks, rods, lamps, glue systems, and ready kits.",
        },
        {
          icon: ShieldCheck,
          title: "Social Package",
          desc: "Purchase kits and courses under the government program with preferential terms.",
        },
        {
          icon: Award,
          title: "Certification",
          desc: "Receive an internationally recognized PDR master certificate upon course completion.",
        },
      ],
      why_title: "Why Choose Us?",
      why: [
        "10+ years of experience in Uzbekistan",
        "International certification standards",
        "Real hands-on training",
        "Job placement support after courses",
        "Courses for all skill levels",
        "High-quality professional tools",
        "Service in 3 languages (UZ/EN/RU)",
        "Based in Tashkent, shipping across Uzbekistan",
      ],
      team_title: "Our Team",
      team: [
        { name: "Bobur Rakhimov", role: "Head Instructor · PDR Master", stars: 5 },
        { name: "Timur Eshmatov", role: "Senior PDR Technician", stars: 5 },
        { name: "Nilufar Karimova", role: "Sales Manager", stars: 5 },
      ],
      location: "Location: Tashkent, Uzbekistan",
      cta_title: "Contact Us",
      cta_desc: "Have questions? Call us or message us on Telegram.",
      cta_btn: "Get in Touch",
    },
  };

  const p = t[lang] ?? t.uz;

  return (
    <div className="w-full">

      {/* Hero */}
      <section className="bg-[#0f3460] py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="section-badge-dark mx-auto">
            <Award size={13} /> {p.badge}
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight mb-4">
            {p.hero_title}
          </h1>
          <p className="text-blue-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {p.hero_sub}
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0a2748] border-t border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-blue-900/40">
            {p.stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="py-6 text-center"
              >
                <div className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-1 leading-none">{s.value}</div>
                <div className="text-blue-300 text-xs uppercase tracking-widest font-medium mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story + Mission */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-badge-light">{p.hero_label}</div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] mb-5 leading-tight heading-accent">{p.story_title}</h2>
            <p className="text-gray-600 leading-relaxed text-base mt-8">{p.story_body}</p>

            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h3 className="text-lg font-heading font-bold text-[#0f3460] mb-3">{p.mission_title}</h3>
              <p className="text-gray-600 text-sm leading-loose">{p.mission_body}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative bg-[#0f3460] rounded-3xl overflow-hidden p-8 text-white">
              <div className="text-6xl mb-6 text-center">🔧</div>
              <div className="text-center mb-8">
                <div className="text-xl font-display font-bold mb-2">PDR CENTER UZBEKISTAN</div>
                <div className="text-blue-200 text-sm">Professional PDR Training & Tools</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <MapPin size={16} className="text-blue-300 shrink-0" />
                  <span className="text-sm">{p.location}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <Phone size={16} className="text-blue-300 shrink-0" />
                  <span className="text-sm">+998 90 578 32 72</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <Send size={16} className="text-blue-300 shrink-0" />
                  <span className="text-sm">@pdrtoolls · @pdrcenteruzbekistan</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-14 md:py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="section-badge-light mx-auto">PDR Center</div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">{p.services_title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {p.services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 mb-5 group-hover:bg-blue-700 group-hover:text-white transition-all">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-heading font-bold text-gray-900 mb-2 leading-snug">{svc.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{svc.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="section-badge-light mx-auto">PDR Center</div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">{p.why_title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {p.why.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <CheckCircle2 size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-14 md:py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="section-badge-light mx-auto">PDR Center</div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3460] leading-tight">{p.team_title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {p.team.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-[#0f3460] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <Users size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-500 text-xs mb-3">{member.role}</p>
                <div className="flex justify-center gap-0.5">
                  {[...Array(member.stars)].map((_, si) => (
                    <Star key={si} size={14} className="text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-[#0f3460]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4 leading-tight">{p.cta_title}</h2>
          <p className="text-blue-200 mb-8 text-sm">{p.cta_desc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-[#0f3460] font-display font-bold uppercase tracking-wider rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={16} /> {p.cta_btn}
            </Link>
            <a
              href="https://t.me/pdrtoolls"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-white/10 text-white border border-white/20 font-display font-bold uppercase tracking-wider rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} /> Telegram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
