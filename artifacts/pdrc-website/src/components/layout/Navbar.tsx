import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useAppStore } from "@/store/use-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, User, Search, Phone, ShoppingCart,
  Instagram, Send, Home, ChevronDown, LogOut, MessageCircle,
  ChevronRight, LayoutGrid, GraduationCap, FileText, Info,
  Truck, ShieldCheck, Handshake
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const CATALOG_CATEGORIES = [
  { key: "Tayyor to'plamlar", label: "Tayyor to'plamlar", icon: "🎁" },
  { key: "Kanchallar", label: "Kanchallar", icon: "🔧" },
  { key: "Aksessuarlar", label: "Aksessuarlar", icon: "🛠️" },
  { key: "Lampalar", label: "Lampalar", icon: "💡" },
  { key: "Yelim tizimi", label: "Yelim tizimi", icon: "🔩" },
  { key: "Ijtimoiy shartnoma", label: "Ijtimoiy shartnoma", icon: "📋" },
];

const LANG_FLAGS: Record<string, string> = { uz: "🇺🇿", en: "🇺🇸", ru: "🇷🇺" };

export function Navbar() {
  const { t } = useTranslation();
  const { lang, setLang, user, logout, setCartOpen, token } = useAppStore();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { data: cartRows = [] } = useQuery<{ id: number }[]>({
    queryKey: ["cart"],
    queryFn: () => api.get<{ id: number }[]>("/cart"),
    enabled: !!token,
    staleTime: 30000,
  });
  const cartCount = cartRows.length;

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const cycleLang = () => {
    const langs: Array<"uz" | "en" | "ru"> = ["uz", "en", "ru"];
    const next = langs[(langs.indexOf(lang) + 1) % langs.length];
    setLang(next);
  };

  const topUtilityLinks = [
    { href: "/shop", label: lang === "uz" ? "Katalog" : lang === "ru" ? "Каталог" : "Catalog" },
    { href: "/about", label: lang === "uz" ? "Biz haqimizda" : lang === "ru" ? "О нас" : "About us" },
    { href: "/delivery", label: lang === "uz" ? "Yetkazib berish" : lang === "ru" ? "Доставка" : "Delivery" },
    { href: "/services", label: lang === "uz" ? "Kafolat" : lang === "ru" ? "Гарантия" : "Warranty" },
    { href: "/contact", label: lang === "uz" ? "Sheriklik" : lang === "ru" ? "Партнёрство" : "Partnership" },
    { href: "/reviews", label: lang === "uz" ? "Sharhlar" : lang === "ru" ? "Отзывы" : "Reviews" },
    { href: "/contact", label: lang === "uz" ? "Aloqa" : lang === "ru" ? "Контакт" : "Contact" },
  ];

  const catalogNavItems = [
    { href: "/", label: lang === "uz" ? "Bosh sahifa" : lang === "ru" ? "Главная" : "Home", icon: <Home size={14} /> },
    { href: "/services", label: lang === "uz" ? "Xizmatlar" : lang === "ru" ? "Услуги" : "Services" },
    { href: "/courses", label: lang === "uz" ? "Kurslar" : lang === "ru" ? "Курсы" : "Courses" },
    { href: "/gallery", label: lang === "uz" ? "Galereya" : lang === "ru" ? "Галерея" : "Gallery" },
  ];

  if (user?.role === "admin") {
    catalogNavItems.push({ href: "/admin", label: lang === "uz" ? "Admin" : "Admin" });
  }

  const mobileNavItems = [
    { href: "/", icon: Home, label: lang === "uz" ? "Bosh sahifa" : lang === "ru" ? "Главная" : "Home" },
    { href: "/shop", icon: LayoutGrid, label: lang === "uz" ? "Katalog" : lang === "ru" ? "Каталог" : "Catalog" },
    { href: "/courses", icon: GraduationCap, label: lang === "uz" ? "Kurslar" : lang === "ru" ? "Обучение" : "Courses" },
    { href: "/shop?cat=" + encodeURIComponent("Ijtimoiy shartnoma"), icon: FileText, label: lang === "uz" ? "Ijtimoiy shartnoma" : lang === "ru" ? "Соц. контракт" : "Social package" },
    { href: "/about", icon: Info, label: lang === "uz" ? "Biz haqimizda" : lang === "ru" ? "О нас" : "About us" },
    { href: "/delivery", icon: Truck, label: lang === "uz" ? "Yetkazib berish" : lang === "ru" ? "Доставка и оплата" : "Delivery & payment" },
    { href: "/services", icon: ShieldCheck, label: lang === "uz" ? "Kafolat" : lang === "ru" ? "Гарантия" : "Warranty" },
    { href: "/contact", icon: Handshake, label: lang === "uz" ? "Sheriklik" : lang === "ru" ? "Партнёрство" : "Partnership" },
    { href: "/contact", icon: User, label: lang === "uz" ? "Aloqa" : lang === "ru" ? "Контакты" : "Contacts" },
    ...(user ? [{ href: "/profile", icon: User, label: lang === "uz" ? "Profilim" : lang === "ru" ? "Мой профиль" : "My profile" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", icon: User, label: "Admin" }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-md">

      {/* ══════════════════════════════════════════
          DESKTOP HEADER (hidden on mobile)
          ══════════════════════════════════════════ */}

      {/* TIER 1: Top Utility Bar */}
      <div className="nav-top-bar hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9">
            <nav className="flex items-center gap-4 overflow-x-auto scrollbar-none">
              {topUtilityLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="text-xs font-medium text-slate-600 hover:text-blue-700 whitespace-nowrap transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="tel:+998905783272"
                className="px-3 py-1 bg-blue-700 text-white text-xs font-bold rounded hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                {lang === "uz" ? "Qo'ng'iroq buyurtma" : lang === "ru" ? "Заказать звонок" : "Order a call"}
              </a>
              <div className="flex items-center gap-0.5">
                {(['uz', 'en', 'ru'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-0.5 text-xs font-bold uppercase rounded transition-all ${
                      lang === l ? "bg-blue-700 text-white" : "text-slate-600 hover:text-blue-700"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <User size={12} className="text-blue-700" />
                    <span className="hidden lg:block font-medium truncate max-w-[100px]">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={11} />
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors">
                  {t.nav.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Brand Bar */}
      <div className="nav-brand-bar hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-[72px]">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}images/logo-icon.png`}
                alt="PDRC Logo"
                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <div className="font-display font-bold text-base leading-tight text-[#0f3460] tracking-wider">PDRC</div>
                <div className="text-[9px] text-slate-500 tracking-[0.2em] uppercase leading-tight">Uzbekistan</div>
              </div>
            </Link>
            <div className="flex flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "uz" ? "Mahsulot qidirish..." : lang === "ru" ? "Поиск товаров..." : "Search products..."}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-700 transition-colors">
                  <Search size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end">
                <a href="tel:+998905783272" className="flex items-center gap-1.5 text-[#0f3460] font-bold text-sm hover:text-blue-600 transition-colors">
                  <Phone size={14} className="text-blue-600" />
                  +998 90 578 32 72
                </a>
                <a href="tel:+998974026565" className="text-xs text-slate-500 hover:text-blue-600 transition-colors mt-0.5 pl-5">
                  +998 97 402 65 65
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <a href="https://wa.me/998905783272" target="_blank" rel="noreferrer" title="WhatsApp"
                  className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all">
                  <MessageCircle size={14} />
                </a>
                <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer" title="Telegram"
                  className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                  <Send size={14} />
                </a>
                <a href="viber://chat?number=998905783272" target="_blank" rel="noreferrer" title="Viber"
                  className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all">
                  <Phone size={14} />
                </a>
                <a href="https://instagram.com/pdrcenteruzbekistan" target="_blank" rel="noreferrer" title="Instagram"
                  className="w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition-all">
                  <Instagram size={14} />
                </a>
              </div>
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white transition-all"
              >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 3: Catalog Category Bar */}
      <div className="nav-catalog-bar hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-11 gap-1 overflow-x-auto scrollbar-none">
            {catalogNavItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all rounded-sm shrink-0 ${
                  location === item.href ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon && item.icon}
                {item.label}
              </Link>
            ))}
            <div className="w-px h-4 bg-white/20 mx-1 shrink-0" />
            <div className="relative shrink-0" onMouseEnter={() => setCatalogOpen(true)} onMouseLeave={() => setCatalogOpen(false)}>
              <Link
                href="/shop"
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all rounded-sm ${
                  location === "/shop" ? "bg-white/20 text-white" : "text-white hover:bg-white/10"
                }`}
              >
                {lang === "uz" ? "Katalog" : lang === "ru" ? "Каталог" : "Catalog"}
                <ChevronDown size={12} className={`transition-transform ${catalogOpen ? "rotate-180" : ""}`} />
              </Link>
              <AnimatePresence>
                {catalogOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    {CATALOG_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.key}
                        href={`/shop?cat=${encodeURIComponent(cat.key)}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-medium">{cat.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {CATALOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={`/shop?cat=${encodeURIComponent(cat.key)}`}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-blue-100 hover:bg-white/10 hover:text-white transition-all rounded-sm shrink-0"
              >
                {cat.icon} {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE HEADER (hidden on desktop)
          3 rows matching pdrc.ru style
          ══════════════════════════════════════════ */}
      <div className="md:hidden bg-white border-b border-gray-200">

        {/* Row 1: Logo + Lang + User + Cart */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}images/logo-icon.png`}
              alt="PDRC"
              className="w-8 h-8 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div className="font-display font-bold text-sm text-[#0f3460] tracking-wider leading-tight">PDRC</div>
              <div className="text-[9px] text-slate-500 tracking-[0.2em] uppercase leading-tight">Uzbekistan</div>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleLang}
              className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-xs font-semibold text-slate-700 hover:border-blue-300 transition-all"
            >
              <span className="text-base leading-none">{LANG_FLAGS[lang]}</span>
              <span className="uppercase">{lang}</span>
              <ChevronDown size={10} className="text-gray-400" />
            </button>

            {user ? (
              <Link href="/profile" className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-700 transition-colors">
                <User size={18} />
              </Link>
            ) : (
              <Link href="/login" className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-700 transition-colors">
                <User size={18} />
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-700 transition-colors"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Social icons + Phone */}
        <div className="flex items-center justify-between px-4 h-9 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <a href="https://wa.me/998905783272" target="_blank" rel="noreferrer" title="WhatsApp"
              className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors">
              <MessageCircle size={14} />
            </a>
            <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer" title="Telegram"
              className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <Send size={14} />
            </a>
            <a href="viber://chat?number=998905783272" target="_blank" rel="noreferrer" title="Viber"
              className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors">
              <Phone size={14} />
            </a>
          </div>
          <a href="tel:+998905783272" className="text-xs font-bold text-[#0f3460] hover:text-blue-600 transition-colors">
            +998 90 578 32 72
          </a>
        </div>

        {/* Row 3: ≡ MENYU + CTA + Search */}
        <div className="flex items-center justify-between px-4 h-11">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-[#0f3460] hover:text-blue-600 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
            <span className="font-display tracking-wider text-xs">
              {lang === "uz" ? "MENYU" : lang === "ru" ? "МЕНЮ" : "MENU"}
            </span>
          </button>

          <a
            href="tel:+998905783272"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-full hover:bg-blue-800 transition-colors whitespace-nowrap"
          >
            <Phone size={12} />
            {lang === "uz" ? "Qo'ng'iroq buyurtma" : lang === "ru" ? "Обратный звонок" : "Call back"}
          </a>

          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-700 transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Expandable search bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="px-4 py-3 bg-gray-50">
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === "uz" ? "Mahsulot qidirish..." : lang === "ru" ? "Поиск товаров..." : "Search products..."}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE MENU — full-screen blue-button style
          (pdrc.ru МЕНЮ screenshot)
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden fixed inset-0 top-0 bg-white z-[100] overflow-y-auto"
          >
            {/* Header: MENYU + X */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="w-8" />
              <h2 className="text-blue-700 font-display font-bold text-base tracking-[0.2em]">
                {lang === "uz" ? "MENYU" : lang === "ru" ? "МЕНЮ" : "MENU"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Large blue nav buttons */}
            <div className="px-4 py-4 space-y-3">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href.split("?")[0]));
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 w-full px-5 py-4 rounded-xl text-base font-semibold transition-all active:scale-[0.98] ${
                      isActive
                        ? "bg-blue-800 text-white shadow-lg"
                        : "bg-blue-700 text-white hover:bg-blue-800"
                    }`}
                  >
                    <Icon size={20} className="shrink-0 opacity-90" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight size={18} className="opacity-60 shrink-0" />
                  </Link>
                );
              })}
            </div>

            {/* Lang switcher + Auth */}
            <div className="px-4 pb-8 pt-2 space-y-3 border-t border-gray-100 mt-2">
              <div className="flex gap-2 pt-2">
                {(['uz', 'en', 'ru'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold uppercase rounded-xl transition-all ${
                      lang === l
                        ? "bg-blue-700 text-white shadow-md"
                        : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="text-base">{LANG_FLAGS[l]}</span>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-700">
                    <User size={16} className="text-blue-600" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full py-3.5 bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-blue-800 transition-colors"
                >
                  {t.nav.login}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
