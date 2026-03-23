import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { ContentSection } from "@/components/admin/ContentSection";
import {
  FileDown, CheckSquare, Square, ToggleLeft, ToggleRight, Trash2, Tag, X, Loader2,
} from "lucide-react";

interface Product {
  id: number;
  nameUz: string; nameEn: string; nameRu: string;
  price: number; discountPrice: number | null;
  stock: number; inStock: boolean; category: string | null; imageUrl: string | null;
}

interface BulkPanelProps {
  lang: string;
  token: string | null;
  categories: { nameUz: string }[];
}

function BulkActionsPanel({ lang, token, categories }: BulkPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkDiscount, setBulkDiscount] = useState("");
  const [showPriceInput, setShowPriceInput] = useState(false);

  const { data, isLoading } = useQuery<{ items: Product[]; total: number }>({
    queryKey: ["products-bulk-list"],
    queryFn: () => api.get<{ items: Product[]; total: number }>("/products?pageSize=200"),
  });

  const products: Product[] = Array.isArray(data) ? data : (data?.items ?? []);

  const bulkMutation = useMutation({
    mutationFn: (body: object) => api.post("/products/bulk", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-bulk-list"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelected([]);
      setShowPriceInput(false);
      setBulkPrice("");
      setBulkDiscount("");
      toast({ title: lang === "uz" ? "Muvaffaqiyatli bajarildi" : "Done" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const handleExport = async () => {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiBase}/api/admin/export/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `products_${Date.now()}.xlsx`; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map((p) => p.id));
  };

  const toggleOne = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const allSelected = products.length > 0 && selected.length === products.length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Mahsulotlar (Bulk Boshqaruv)" : "Products (Bulk Management)"}
        </h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
          <FileDown size={16} />
          {lang === "uz" ? "Excel yuklab olish" : "Export Excel"}
        </button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <span className="text-sm font-semibold text-blue-700">
            {selected.length} {lang === "uz" ? "ta tanlangan" : "selected"}
          </span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button
              onClick={() => bulkMutation.mutate({ ids: selected, action: "activate" })}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
            >
              <ToggleRight size={14} />{lang === "uz" ? "Faollashtirish" : "Activate"}
            </button>
            <button
              onClick={() => bulkMutation.mutate({ ids: selected, action: "deactivate" })}
              className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-semibold hover:bg-yellow-600"
            >
              <ToggleLeft size={14} />{lang === "uz" ? "O'chirish (aktiv)" : "Deactivate"}
            </button>
            <button
              onClick={() => setShowPriceInput(!showPriceInput)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700"
            >
              <Tag size={14} />{lang === "uz" ? "Narx o'zgartirish" : "Set Price"}
            </button>
            <button
              onClick={() => {
                if (confirm(lang === "uz" ? "O'chirishni tasdiqlaysizmi?" : "Confirm delete?"))
                  bulkMutation.mutate({ ids: selected, action: "delete" });
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
            >
              <Trash2 size={14} />{lang === "uz" ? "O'chirish" : "Delete"}
            </button>
            <button onClick={() => setSelected([])} className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {showPriceInput && selected.length > 0 && (
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl p-3 flex-wrap">
          <input
            type="number" placeholder={lang === "uz" ? "Yangi narx (UZS)" : "New price (UZS)"}
            value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-44"
          />
          <input
            type="number" placeholder={lang === "uz" ? "Chegirma narxi (ixtiyoriy)" : "Discount price (opt)"}
            value={bulkDiscount} onChange={(e) => setBulkDiscount(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48"
          />
          <button
            onClick={() => {
              if (!bulkPrice) return;
              bulkMutation.mutate({
                ids: selected, action: "set_price",
                price: Number(bulkPrice),
                ...(bulkDiscount ? { discountPrice: Number(bulkDiscount) } : {}),
              });
            }}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
          >
            {lang === "uz" ? "Qo'llash" : "Apply"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <button onClick={toggleAll} className="text-blue-600 hover:text-blue-800">
            {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>
          <span className="text-sm text-gray-600 font-medium">
            {products.length} {lang === "uz" ? "ta mahsulot" : "products"}
          </span>
          {bulkMutation.isPending && <Loader2 size={16} className="animate-spin text-blue-500 ml-auto" />}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">{lang === "uz" ? "Yuklanmoqda..." : "Loading..."}</div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {products.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition ${selected.includes(p.id) ? "bg-blue-50" : ""}`}>
                <button onClick={() => toggleOne(p.id)} className="text-blue-600 hover:text-blue-800 flex-shrink-0">
                  {selected.includes(p.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.nameUz} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {lang === "uz" ? p.nameUz : lang === "ru" ? p.nameRu : p.nameEn}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {p.category} • {p.discountPrice ? `${p.discountPrice.toLocaleString()} UZS` : `${p.price.toLocaleString()} UZS`}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {p.inStock ? (lang === "uz" ? "Mavjud" : "In Stock") : (lang === "uz" ? "Tugagan" : "Out")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductsSectionProps {
  lang: string;
  token: string | null;
  categories: { nameUz: string }[];
}

export function ProductsSection({ lang, token, categories }: ProductsSectionProps) {
  return (
    <div className="space-y-0">
      <BulkActionsPanel lang={lang} token={token} categories={categories} />

      <div className="px-6 pb-6">
        <div className="bg-gray-100 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            {lang === "uz" ? "Mahsulot qo'shish / tahrirlash" : "Add / Edit Products"}
          </h2>
          <ContentSection
            title={lang === "uz" ? "Mahsulotlar" : "Products"}
            apiPath="products"
            queryKey="products"
            defaultValues={{ inStock: true, stock: 0 }}
            fields={[
              { key: "nameUz", label: "Nomi (UZ)", type: "text", required: true },
              { key: "nameEn", label: "Name (EN)", type: "text", required: true },
              { key: "nameRu", label: "Название (RU)", type: "text", required: true },
              { key: "descriptionUz", label: "Tavsif (UZ)", type: "textarea", required: true },
              { key: "descriptionEn", label: "Description (EN)", type: "textarea", required: true },
              { key: "descriptionRu", label: "Описание (RU)", type: "textarea", required: true },
              { key: "price", label: lang === "uz" ? "Narxi (UZS)" : "Price (UZS)", type: "number", required: true },
              { key: "discountPrice", label: lang === "uz" ? "Chegirma narxi (UZS)" : "Discount Price (UZS)", type: "number" },
              { key: "stock", label: lang === "uz" ? "Ombordagi miqdor" : "Stock Quantity", type: "number" },
              {
                key: "category",
                label: lang === "uz" ? "Kategoriya" : "Category",
                type: categories.length > 0 ? "select" : "text",
                required: true,
                options: categories.map((c) => c.nameUz),
                placeholder: lang === "uz" ? "Kategoriyani tanlang" : "Select category",
              },
              { key: "imageUrl", label: lang === "uz" ? "Rasm" : "Image", type: "image" },
              { key: "inStock", label: lang === "uz" ? "Mavjud" : "In Stock", type: "checkbox" },
            ]}
            displayFn={(item, l) => ({
              title: String(l === "uz" ? item.nameUz : l === "ru" ? item.nameRu : item.nameEn),
              subtitle: String(l === "uz" ? item.nameEn : item.nameUz) + " / " + String(item.nameRu),
              meta: item.discountPrice
                ? `${Number(item.discountPrice).toLocaleString()} UZS (${Number(item.price).toLocaleString()})`
                : `${Number(item.price).toLocaleString()} UZS`,
              badge: String(item.category),
              image: item.imageUrl ? String(item.imageUrl) : undefined,
            })}
          />
        </div>
      </div>
    </div>
  );
}
