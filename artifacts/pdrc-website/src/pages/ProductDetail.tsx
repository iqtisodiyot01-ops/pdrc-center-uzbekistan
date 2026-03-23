import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/use-store";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, ShoppingCart, Heart, Package, ZoomIn, X,
  AlertCircle, CheckCircle2, Tag, ChevronRight,
} from "lucide-react";

interface Product {
  id: number; nameUz: string; nameEn: string; nameRu: string;
  descriptionUz: string; descriptionEn: string; descriptionRu: string;
  price: number; discountPrice?: number | null; stock: number;
  imageUrl?: string | null; category: string; inStock: boolean;
}

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { lang, token, setCartOpen } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [imgZoom, setImgZoom] = useState(false);
  const [descTab, setDescTab] = useState<"uz" | "en" | "ru">(lang as "uz" | "en" | "ru");

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ["product", params.id],
    queryFn: () => api.get<Product>(`/products/${params.id}`),
    enabled: !!params.id && !!token,
  });

  const { data: allProductsData } = useQuery<{ items: Product[] } | Product[]>({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
  });
  const allProducts: Product[] = Array.isArray(allProductsData)
    ? allProductsData
    : (allProductsData as { items: Product[] })?.items ?? [];

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
      toast({ title: lang === "uz" ? "Savatga qo'shildi!" : lang === "ru" ? "Добавлено в корзину!" : "Added to cart!" });
    },
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: number) => {
      if (wishlistIds.has(productId)) return api.delete(`/wishlist/${productId}`);
      return api.post("/wishlist", { productId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  if (!token) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-gray-400" />
        <p className="text-gray-600 font-medium">
          {lang === "uz" ? "Mahsulot topilmadi" : lang === "ru" ? "Товар не найден" : "Product not found"}
        </p>
        <Link href="/shop" className="text-blue-600 underline text-sm">
          {lang === "uz" ? "Katalogga qaytish" : lang === "ru" ? "Вернуться в каталог" : "Back to catalog"}
        </Link>
      </div>
    );
  }

  const getName = (p: Product) => lang === "uz" ? p.nameUz : lang === "ru" ? p.nameRu : p.nameEn;
  const getDesc = (p: Product) => {
    if (descTab === "uz") return p.descriptionUz;
    if (descTab === "ru") return p.descriptionRu;
    return p.descriptionEn;
  };

  const discountPct = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const displayPrice = discountPct > 0 ? product.discountPrice! : product.price;
  const inWishlist = wishlistIds.has(product.id);

  const similarProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 8);

  const stockStatus = product.stock <= 0
    ? { label: lang === "uz" ? "Tugagan" : lang === "ru" ? "Нет в наличии" : "Out of stock", color: "text-red-600 bg-red-50", icon: AlertCircle }
    : product.stock <= 5
    ? { label: lang === "uz" ? `${product.stock} ta qoldi` : lang === "ru" ? `Осталось ${product.stock} шт` : `${product.stock} left`, color: "text-orange-600 bg-orange-50", icon: AlertCircle }
    : { label: lang === "uz" ? `${product.stock} ta mavjud` : lang === "ru" ? `${product.stock} шт в наличии` : `${product.stock} in stock`, color: "text-green-600 bg-green-50", icon: CheckCircle2 };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb nav */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-gray-500">
          <Link href="/shop" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">
            <ArrowLeft size={14} />
            {lang === "uz" ? "Katalog" : lang === "ru" ? "Каталог" : "Catalog"}
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-400">{product.category}</span>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-semibold line-clamp-1 max-w-[200px]">{getName(product)}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Product main section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center min-h-[320px] md:min-h-[460px] overflow-hidden group">
              {discountPct > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-lg shadow-md">
                  -{discountPct}%
                </span>
              )}
              {product.imageUrl ? (
                <>
                  <img
                    src={product.imageUrl}
                    alt={getName(product)}
                    className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                    onClick={() => setImgZoom(true)}
                  />
                  <button
                    onClick={() => setImgZoom(true)}
                    className="absolute bottom-4 right-4 w-9 h-9 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ZoomIn size={16} className="text-gray-600" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <Package size={64} />
                  <span className="text-sm">{lang === "uz" ? "Rasm yo'q" : lang === "ru" ? "Нет фото" : "No image"}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col gap-4">
              {/* Category badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                  <Tag size={11} />
                  {product.category}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {getName(product)}
              </h1>

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${discountPct > 0 ? "text-red-600" : "text-gray-900"}`}>
                  {displayPrice.toLocaleString()}
                  <span className="text-base font-normal ml-1 text-gray-500">UZS</span>
                </span>
                {discountPct > 0 && (
                  <span className="text-lg text-gray-400 line-through mb-0.5">
                    {product.price.toLocaleString()} UZS
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold w-fit ${stockStatus.color}`}>
                <stockStatus.icon size={15} />
                {stockStatus.label}
              </div>

              {/* Description tabs */}
              <div className="flex-1">
                <div className="flex gap-1 mb-3 border-b border-gray-100 pb-2">
                  {(["uz", "en", "ru"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setDescTab(l)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        descTab === l ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
                  {getDesc(product)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => product.inStock && addToCart.mutate(product.id)}
                  disabled={!product.inStock || addToCart.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors text-sm"
                >
                  <ShoppingCart size={18} />
                  {lang === "uz" ? "Savatga qo'shish" : lang === "ru" ? "В корзину" : "Add to cart"}
                </button>
                <button
                  onClick={() => toggleWishlist.mutate(product.id)}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all ${
                    inWishlist
                      ? "bg-red-50 border-red-300 text-red-500"
                      : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400"
                  }`}
                >
                  <Heart size={20} className={inWishlist ? "fill-current" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {lang === "uz" ? "Shu kategoriyadan boshqalar" : lang === "ru" ? "Похожие товары" : "Similar products"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {similarProducts.map((p) => {
                const pct = p.discountPrice && p.discountPrice < p.price
                  ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
                const price = pct > 0 ? p.discountPrice! : p.price;
                return (
                  <Link key={p.id} href={`/shop/${p.id}`} className="group bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden flex flex-col">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {pct > 0 && (
                        <span className="absolute top-1.5 left-1.5 z-10 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded">
                          -{pct}%
                        </span>
                      )}
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={getName(p)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">
                        {getName(p)}
                      </p>
                      <p className={`text-xs font-bold ${pct > 0 ? "text-red-600" : "text-gray-900"}`}>
                        {price.toLocaleString()} UZS
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {imgZoom && product.imageUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setImgZoom(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setImgZoom(false)}
          >
            <X size={20} />
          </button>
          <img
            src={product.imageUrl}
            alt={getName(product)}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
