import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAppStore } from "@/store/use-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Package, ShoppingCart, Heart, Search, ChevronRight, Tag,
  Star, Percent, AlertCircle, LayoutGrid, List, SlidersHorizontal, X,
} from "lucide-react";

const CAT_COLORS = [
  { active: "bg-blue-600 text-white", dot: "bg-blue-500" },
  { active: "bg-orange-500 text-white", dot: "bg-orange-400" },
  { active: "bg-purple-600 text-white", dot: "bg-purple-500" },
  { active: "bg-green-600 text-white", dot: "bg-green-500" },
  { active: "bg-rose-600 text-white", dot: "bg-rose-500" },
  { active: "bg-teal-600 text-white", dot: "bg-teal-500" },
  { active: "bg-yellow-500 text-white", dot: "bg-yellow-400" },
  { active: "bg-slate-700 text-white", dot: "bg-slate-500" },
];

interface ApiCategory {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  icon: string | null; sortOrder: number;
}
interface Product {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  descriptionUz: string; descriptionEn: string; descriptionRu: string;
  price: number; discountPrice?: number | null; stock: number;
  imageUrl?: string | null; category: string; inStock: boolean;
}

function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md shadow">
      -{pct}%
    </span>
  );
}

function StockBadge({ stock, lang }: { stock: number; lang: string }) {
  if (stock <= 0) return (
    <span className="absolute top-2 right-10 z-10 bg-gray-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
      {lang === "uz" ? "Tugagan" : lang === "ru" ? "Нет" : "Out"}
    </span>
  );
  if (stock <= 5) return (
    <span className="absolute top-2 right-10 z-10 bg-orange-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
      {lang === "uz" ? `${stock} ta` : lang === "ru" ? `${stock} шт` : `${stock} left`}
    </span>
  );
  return null;
}

export default function Shop() {
  const { lang, token, setCartOpen } = useAppStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("cat") || "";
    setActiveCategory(cat);
  }, []);

  const { data: categories = [] } = useQuery<ApiCategory[]>({
    queryKey: ["categories"],
    queryFn: () => api.get<ApiCategory[]>("/categories"),
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api.get<Product[]>("/products"),
    enabled: !!token,
  });

  const { data: wishlistItems = [] } = useQuery<{ id: number; product: { id: number } | null }[]>({
    queryKey: ["wishlist"],
    queryFn: () => api.get("/wishlist"),
    enabled: !!token,
  });
  const wishlistIds = new Set(wishlistItems.map((w) => w.product?.id).filter(Boolean));

  const addToCart = useMutation({
    mutationFn: (productId: number) => api.post("/cart", { productId, quantity: 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      setCartOpen(true);
      toast({ title: lang === "uz" ? "Savatga qo'shildi" : lang === "ru" ? "Добавлено в корзину" : "Added to cart" });
    },
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: number) => {
      if (wishlistIds.has(productId)) return api.delete(`/wishlist/${productId}`);
      return api.post("/wishlist", { productId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const getCatLabel = (c: ApiCategory) =>
    lang === "uz" ? c.nameUz : lang === "ru" ? c.nameRu : c.nameEn;

  const getProdName = (p: Product) =>
    lang === "uz" ? p.nameUz : lang === "ru" ? p.nameRu : p.nameEn;

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory ? p.category === activeCategory : true;
    const matchSearch = search.trim()
      ? getProdName(p).toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key === activeCategory ? "" : key);
    setSidebarOpen(false);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const discountPct = (p: Product) =>
    p.discountPrice && p.discountPrice < p.price
      ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
      : 0;

  const activeCatObj = categories.find((c) => c.nameUz === activeCategory || c.nameEn === activeCategory);
  const activeCatLabel = activeCatObj ? getCatLabel(activeCatObj) : activeCategory;

  const l = {
    uz: { all: "Barchasi", search: "Mahsulot qidirish...", products: "ta mahsulot", noProducts: "Mahsulot topilmadi", loading: "Yuklanmoqda..." },
    ru: { all: "Все", search: "Поиск товаров...", products: "товаров", noProducts: "Товары не найдены", loading: "Загрузка..." },
    en: { all: "All", search: "Search products...", products: "products", noProducts: "No products found", loading: "Loading..." },
  }[lang] || { all: "All", search: "Search...", products: "products", noProducts: "No products", loading: "Loading..." };

  return (
    <div className="min-h-screen bg-gray-50" ref={topRef}>
      <div className="flex h-[calc(100vh-128px)] md:h-[calc(100vh-152px)]">

        {/* ── Sidebar (Desktop) ── */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
          <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Tag size={14} className="text-blue-600" />
              {lang === "uz" ? "Kategoriyalar" : lang === "ru" ? "Категории" : "Categories"}
            </h2>
          </div>
          <nav className="flex-1 py-2">
            <button
              onClick={() => handleCategoryClick("")}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${
                !activeCategory ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">🛒</span>
              {l.all}
              <span className="ml-auto text-xs text-gray-400">{products.length}</span>
            </button>
            {categories.map((cat, i) => {
              const colors = CAT_COLORS[i % CAT_COLORS.length];
              const count = products.filter((p) => p.category === cat.nameUz).length;
              const isActive = activeCategory === cat.nameUz;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.nameUz)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? `${colors.active} font-semibold`
                      : "text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
                >
                  <span className="text-base shrink-0">{cat.icon || "📦"}</span>
                  <span className="flex-1 leading-tight text-left">{getCatLabel(cat)}</span>
                  <span className={`ml-auto text-xs shrink-0 ${isActive ? "text-white/70" : "text-gray-400"}`}>{count}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-72 bg-white h-full overflow-y-auto z-10 shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                  {lang === "uz" ? "Kategoriyalar" : lang === "ru" ? "Категории" : "Categories"}
                </h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-500 hover:text-gray-900">
                  <X size={18} />
                </button>
              </div>
              <nav className="py-2">
                <button
                  onClick={() => handleCategoryClick("")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                    !activeCategory ? "bg-blue-50 text-blue-700" : "text-gray-700"
                  }`}
                >
                  <span className="text-lg">🛒</span>
                  {l.all}
                  <span className="ml-auto text-xs text-gray-400">{products.length}</span>
                </button>
                {categories.map((cat, i) => {
                  const colors = CAT_COLORS[i % CAT_COLORS.length];
                  const count = products.filter((p) => p.category === cat.nameUz).length;
                  const isActive = activeCategory === cat.nameUz;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.nameUz)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm ${
                        isActive ? `${colors.active} font-semibold` : "text-gray-700"
                      }`}
                    >
                      <span className="text-base">{cat.icon || "📦"}</span>
                      <span className="flex-1">{getCatLabel(cat)}</span>
                      <span className={`text-xs ${isActive ? "text-white/70" : "text-gray-400"}`}>{count}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
            <button
              className="md:hidden flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
              onClick={() => setSidebarOpen(true)}
            >
              <SlidersHorizontal size={14} />
              {lang === "uz" ? "Filtr" : lang === "ru" ? "Фильтр" : "Filter"}
            </button>

            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={l.search}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          {activeCategory && (
            <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2">
              <button onClick={() => setActiveCategory("")} className="text-xs text-blue-600 hover:underline">
                {l.all}
              </button>
              <ChevronRight size={12} className="text-gray-400" />
              <span className="text-xs text-gray-700 font-semibold">{activeCatLabel}</span>
              <button onClick={() => setActiveCategory("")} className="ml-auto text-xs text-gray-400 hover:text-gray-700">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Products count */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              {filteredProducts.length} {l.products}
            </span>
            {search && (
              <span className="text-xs text-blue-600">
                &ldquo;{search}&rdquo; {lang === "uz" ? "bo'yicha" : lang === "ru" ? "— результаты" : "— results"}
              </span>
            )}
          </div>

          {/* Products grid / list */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-5 bg-gray-200 rounded w-2/3 mt-1" />
                      <div className="h-8 bg-gray-200 rounded w-full mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">{l.noProducts}</p>
                {activeCategory && (
                  <button onClick={() => setActiveCategory("")} className="text-sm text-blue-600 underline">
                    {l.all}
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const pct = discountPct(product);
                  const displayPrice = product.discountPrice && pct > 0 ? product.discountPrice : product.price;
                  const inWishlist = wishlistIds.has(product.id);
                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer"
                    >
                      <Link href={`/shop/${product.id}`}>
                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          {pct > 0 && <DiscountBadge pct={pct} />}
                          {product.inStock && <StockBadge stock={product.stock} lang={lang} />}
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={getProdName(product)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={40} className="text-gray-300" />
                            </div>
                          )}
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                              <span className="text-white text-xs font-bold bg-gray-800/80 px-2 py-1 rounded">
                                {lang === "uz" ? "Mavjud emas" : lang === "ru" ? "Нет в наличии" : "Out of stock"}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-3 flex flex-col flex-1 gap-2">
                        <Link href={`/shop/${product.id}`}>
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-blue-700 transition-colors">
                            {getProdName(product)}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-1 mt-auto">
                          {pct > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-base font-bold text-red-600">
                                {displayPrice.toLocaleString()} <span className="text-xs">UZS</span>
                              </span>
                              <span className="text-xs text-gray-400 line-through">{product.price.toLocaleString()} UZS</span>
                            </div>
                          ) : (
                            <span className="text-base font-bold text-gray-900">
                              {product.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">UZS</span>
                            </span>
                          )}
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => token && product.inStock && addToCart.mutate(product.id)}
                            disabled={!product.inStock || !token}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                          >
                            <ShoppingCart size={13} />
                            {lang === "uz" ? "Savat" : lang === "ru" ? "Корзина" : "Cart"}
                          </button>
                          <button
                            onClick={() => token && toggleWishlist.mutate(product.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
                              inWishlist
                                ? "bg-red-50 border-red-300 text-red-500"
                                : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400"
                            }`}
                          >
                            <Heart size={14} className={inWishlist ? "fill-current" : ""} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List view */
              <div className="flex flex-col gap-2">
                {filteredProducts.map((product) => {
                  const pct = discountPct(product);
                  const displayPrice = product.discountPrice && pct > 0 ? product.discountPrice : product.price;
                  const inWishlist = wishlistIds.has(product.id);
                  return (
                    <div key={product.id} className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all flex gap-3 p-3">
                      <Link href={`/shop/${product.id}`} className="relative shrink-0 w-20 h-20 rounded-lg bg-gray-100 overflow-hidden">
                        {pct > 0 && (
                          <span className="absolute top-1 left-1 z-10 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                            -{pct}%
                          </span>
                        )}
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={getProdName(product)} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-300" />
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <Link href={`/shop/${product.id}`}>
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-blue-700">{getProdName(product)}</h3>
                        </Link>
                        <span className="text-xs text-gray-400 line-clamp-1">{product.category}</span>
                        <div className="flex items-center gap-2 mt-auto">
                          {pct > 0 ? (
                            <>
                              <span className="text-sm font-bold text-red-600">{displayPrice.toLocaleString()} UZS</span>
                              <span className="text-xs text-gray-400 line-through">{product.price.toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-gray-900">{product.price.toLocaleString()} UZS</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => token && product.inStock && addToCart.mutate(product.id)}
                          disabled={!product.inStock}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 flex items-center gap-1"
                        >
                          <ShoppingCart size={11} />
                          {lang === "uz" ? "Qo'sh" : lang === "ru" ? "Купить" : "Buy"}
                        </button>
                        <button
                          onClick={() => token && toggleWishlist.mutate(product.id)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center justify-center ${
                            inWishlist ? "bg-red-50 border-red-300 text-red-500" : "border-gray-200 text-gray-400"
                          }`}
                        >
                          <Heart size={13} className={inWishlist ? "fill-current" : ""} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
