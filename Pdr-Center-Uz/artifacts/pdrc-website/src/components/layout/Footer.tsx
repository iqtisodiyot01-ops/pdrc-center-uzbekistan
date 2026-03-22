import { Instagram, MapPin, Phone, Youtube, Send } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top blue branding band */}
        <div className="bg-[#0f3460] rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl text-white mb-2">PDR CENTER UZBEKISTAN</h2>
            <p className="text-blue-200 text-sm max-w-md">{t.footer.about}</p>
          </div>
          <div className="flex gap-3">
            <a href="https://instagram.com/pdrcenteruzbekistan" target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#0f3460] transition-all">
              <Instagram size={18} />
            </a>
            <a href="https://t.me/pdrtoolls" target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#0f3460] transition-all">
              <Send size={18} />
            </a>
            <a href="https://youtube.com/@pdrcenteruzbekistan" target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#0f3460] transition-all">
              <Youtube size={18} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          <div>
            <h3 className="font-display text-sm text-[#0f3460] mb-6 uppercase tracking-wider">{t.footer.quick_links}</h3>
            <ul className="space-y-3">
              <li><Link href="/services" className="text-gray-500 hover:text-blue-700 transition-colors text-sm">{t.footer.services}</Link></li>
              <li><Link href="/courses" className="text-gray-500 hover:text-blue-700 transition-colors text-sm">{t.footer.courses}</Link></li>
              <li><Link href="/shop" className="text-gray-500 hover:text-blue-700 transition-colors text-sm">{t.footer.shop}</Link></li>
              <li><Link href="/gallery" className="text-gray-500 hover:text-blue-700 transition-colors text-sm">{t.footer.gallery}</Link></li>
              <li><Link href="/reviews" className="text-gray-500 hover:text-blue-700 transition-colors text-sm">{t.nav.reviews}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm text-[#0f3460] mb-6 uppercase tracking-wider">{t.footer.contact_us}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-500">
                <Phone className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-gray-800 text-sm">{t.footer.main_office}</p>
                  <p className="text-sm">+998 90 578 32 72</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <Phone className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-gray-800 text-sm">{t.footer.manager}</p>
                  <p className="text-sm">+998 97 402 65 65</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <MapPin className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-gray-800 text-sm">{t.footer.location}</p>
                  <p className="text-sm">{t.footer.location_city}</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm text-[#0f3460] mb-6 uppercase tracking-wider">PDR Center</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">pdrcenteruzbekistan.com</p>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">@pdrcenteruzbekistan</p>
              <p className="text-sm text-gray-500">@pdrtoolls (Telegram)</p>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} PDR Center Uzbekistan. {t.footer.rights}
          </p>
          <p className="text-gray-400 text-sm">
            pdrcenteruzbekistan.com
          </p>
        </div>
      </div>
    </footer>
  );
}
