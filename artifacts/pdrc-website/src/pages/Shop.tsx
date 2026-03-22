import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useGetProducts, getGetProductsQueryKey } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { Package, ShoppingCart, Star, Tag, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CATALOG_CATEGORIES = [
  {
    key: "Tayyor to'plamlar",
    icon: "🎁",
    label: { uz: "Tayyor to'plamlar", en: "Ready kits", ru: "Готовые комплекты" },
    desc: { uz: "Professional PDR to'plamlari", en: "Professional PDR kits", ru: "Профессиональные PDR наборы" },
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    accent: "text-blue-700",
  },
  {
    key: "Kanchallar",
    icon: "🔧",
    label: { uz: "Kanchallar", en: "Hooks & tools", ru: "Крючки и инструменты" },
    desc: { uz: "PDR kanchallar to'plami", en: "PDR hooks collection", ru: "Коллекция PDR крючков" },
    color: "from-slate-500 to-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    accent: "text-slate-700",
  },
  {
    key: "Aksessuarlar",
    icon: "🛠️",
    label: { uz: "Aksessuarlar", en: "Accessories", ru: "Аксессуары" },
    desc: { uz: "Qo'shimcha asbob-uskunalar", en: "Additional equipment", ru: "Дополнительное оборудование" },
    color: "from-orange-500 to-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    accent: "text-orange-700",
  },
  {
    key: "Lampalar",
    icon: "💡",
    label: { uz: "Lampalar", en: "Lamps", ru: "Лампы" },
    desc: { uz: "LED va halogen lampalar", en: "LED and halogen lamps", ru: "LED и галогенные лампы" },
    color: "from-yellow-400 to-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    accent: "text-yellow-700",
  },
  {
    key: "Yelim tizimi",
    icon: "🔩",
    label: { uz: "Yelim tizimi", en: "Glue system", ru: "Клеевая система" },
    desc: { uz: "Yelim va applikatorlar", en: "Glue and applicators", ru: "Клей и аппликаторы" },
    color: "from-purple-500 to-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    accent: "text-purple-700",
  },
  {
    key: "Ijtimoiy shartnoma",
    icon: "📋",
    label: { uz: "Ijtimoiy shartnoma", en: "Social package", ru: "Социальный пакет" },
    desc: { uz: "Kompleks xizmat to'plamlari", en: "Complete service packages", ru: "Комплексные пакеты услуг" },
    color: "from-green-500 to-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    accent: "text-green-700",
  },
];

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock?: number;
}

export default function Shop() {
  const { t } = useTranslation();
  const { lang, token, setCartOpen } = useAppStore();
  const [location] = useLocation();
  const productsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const urlCat =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("cat") || ""
      : "";

  const [activeCategory, setActiveCategory] = useState<string>(urlCat);

  const { data: wishlistItems = [] } = useQuery<{ id: number; product: { id: number } | null }[]>({
    queryKey: ["wishlist"],
    queryFn: () => api.get("/wishlist"),
    enabled: !!token,
  });

  const wishlistProductIds = new Set(wishlistItems.map((w) => w.product?.id).filter(Boolean));

  const addToCart = useMutation({
    mutationFn: (productId: number) => api.post("/cart", { productId, quantity: 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: lang === "uz" ? "Savatga qo'shildi" : lang === "ru" ? "Добавлено в корзину" : "Added to cart",
        description: lang === "uz" ? "Mahsulot savatga qo'shildi" : lang === "ru" ? "Товар добавлен в корзину" : "Product added to cart",
      });
    },
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: number) => {
      if (wishlistProductIds.has(productId)) {
        return api.delete(`/wishlist/${productId}`);
      }
      return api.post("/wishlist", { productId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("cat") || "";
    setActiveCategory(cat);
    if (cat && productsRef.current) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location]);

  const { data: products = [] } = useGetProducts<Product[]>(undefined, {
    query: { queryKey: getGetProductsQueryKey(), enabled: !!token },
  });

  const filteredProducts = activeCategory
    ? products.filter((p: Product) => p.category === activeCategory)
    : products;

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key === activeCategory ? "" : key);
    if (productsRef.current) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  const activeCat = CATALOG_CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page header */}
      <section className="bg-[#0f3460] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight mb-2">
            {lang === "uz" ? "Katalog" : lang === "ru" ? "Каталог" : "Catalog"}
          </h1>
          <p className="text-blue-200 text-sm">
            {lang === "uz"
              ? "PDR asbob-uskunalari va materiallar do'koni"
              : lang === "ru"
              ? "Магазин PDR инструментов и материалов"
              : "PDR tools and materials store"}
          </p>
          {activeCategory && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-blue-300 text-sm">›</span>
              <span className="text-white font-semibold text-sm">
                {activeCat?.label[lang] || activeCategory}
              </span>
              <button
                onClick={() => setActiveCategory("")}
                className="ml-2 text-xs text-blue-300 underline hover:text-white transition-colors"
              >
                {lang === "uz" ? "Barchasini ko'rish" : lang === "ru" ? "Смотреть всё" : "View all"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Catalog Category Cards Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {lang === "uz"
              ? "Mahsulot bo'limlari"
              : lang === "ru"
              ? "Разделы каталога"
              : "Catalog sections"}
          </h2>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory("")}
              className="text-sm text-blue-700 font-medium hover:text-blue-900 flex items-center gap-1"
            >
              <Tag size={14} />
              {lang === "uz" ? "Hammasi" : lang === "ru" ? "Все" : "All categories"}
            </button>
          )}
        </div>

        {/* 1-col on very small, 2-col on sm+, 3-col on lg — matching pdrc.ru КАТАЛОГ layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {CATALOG_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const productCount = products.filter(
              (p: Product) => p.category === cat.key
            ).length;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`group text-left rounded-xl border overflow-hidden transition-all duration-200 bg-white active:scale-[0.98] ${
                  isActive
                    ? `${cat.border} border-2 shadow-md`
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md shadow-sm"
                }`}
              >
                {/* Category name at TOP — like pdrc.ru */}
                <div className={`px-3 pt-3 pb-2 border-b ${isActive ? cat.border : "border-gray-100"}`}>
                  <h3 className={`text-xs sm:text-sm font-bold uppercase leading-tight text-center ${
                    isActive ? cat.accent : "text-gray-900"
                  }`}>
                    {cat.label[lang]}
                  </h3>
                </div>

                {/* Image/icon area below */}
                <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 aspect-square">
                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br ${cat.color}`} />
                  )}
                  {/* Large emoji icon */}
                  <div className={`text-5xl sm:text-6xl transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "scale-110" : ""
                  }`}>
                    {cat.icon}
                  </div>
                  {/* Product count */}
                  {products.length > 0 && productCount > 0 && (
                    <span className="mt-2 text-xs text-gray-400 font-medium">
                      {productCount} {lang === "uz" ? "ta" : lang === "ru" ? "шт" : "items"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section
        ref={productsRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {activeCategory
              ? activeCat?.label[lang] || activeCategory
              : lang === "uz"
              ? "Barcha mahsulotlar"
              : lang === "ru"
              ? "Все товары"
              : "All products"}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredProducts.length}{" "}
            {lang === "uz" ? "ta mahsulot" : lang === "ru" ? "товаров" : "products"}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {lang === "uz"
                ? "Mahsulot topilmadi"
                : lang === "ru"
                ? "Товары не найдены"
                : "No products found"}
            </h3>
            <p className="text-gray-500 text-sm">
              {lang === "uz"
                ? "Ushbu bo'limda hozircha mahsulotlar mavjud emas"
                : lang === "ru"
                ? "В этом разделе пока нет товаров"
                : "No products in this section yet"}
            </p>
            <button
              onClick={() => setActiveCategory("")}
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
            >
              {lang === "uz" ? "Barchasini ko'rish" : lang === "ru" ? "Смотреть всё" : "View all"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product: Product) => (
              <div
                key={product.id}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <Package size={40} className="text-gray-300" />
                      <span className="text-xs text-gray-400 font-medium">{product.category}</span>
                    </div>
                  )}

                  {product.category && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                      {CATALOG_CATEGORIES.find((c) => c.key === product.category)?.icon}{" "}
                      {product.category}
                    </div>
                  )}
                  {token && (
                    <button
                      onClick={() => toggleWishlist.mutate(product.id)}
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-sm border transition-all ${
                        wishlistProductIds.has(product.id)
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-white/90 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300"
                      }`}
                    >
                      <Heart size={13} className={wishlistProductIds.has(product.id) ? "fill-current" : ""} />
                    </button>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < 4 ? "text-yellow-400 fill-current" : "text-gray-200 fill-current"
                        }
                      />
                    ))}
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-lg font-bold text-[#0f3460]">
                        {product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">so'm</span>
                    </div>
                    <button
                      onClick={() => { addToCart.mutate(product.id); setCartOpen(true); }}
                      disabled={addToCart.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60"
                    >
                      <ShoppingCart size={13} />
                      {lang === "uz" ? "Savat" : lang === "ru" ? "В корзину" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
