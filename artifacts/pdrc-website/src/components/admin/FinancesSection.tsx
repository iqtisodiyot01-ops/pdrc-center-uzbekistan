import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, Trash2, TrendingUp, TrendingDown, Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface FinanceData {
  transactions: Array<{ id: number; type: string; amount: number; description: string; category: string; referenceId: string | null; createdAt: string }>;
  total: number; totalIncome: number; totalExpense: number; page: number; pageSize: number;
}

export function FinancesSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ type: "income", amount: "", description: "", category: "other" });

  const { data, isLoading } = useQuery<FinanceData>({
    queryKey: ["admin-finances", typeFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (typeFilter) params.set("type", typeFilter);
      return api.get<FinanceData>(`/admin/finances?${params.toString()}`);
    },
  });

  const { data: products } = useQuery<Array<{ id: number; nameUz: string; nameEn: string; price: number; inStock: boolean }>>({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
  });

  const createTx = useMutation({
    mutationFn: (txData: Record<string, unknown>) => api.post("/admin/finances", txData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-finances"] });
      setShowForm(false);
      setForm({ type: "income", amount: "", description: "", category: "other" });
      toast({ title: lang === "uz" ? "Qo'shildi" : "Added" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const deleteTx = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/finances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-finances"] });
      toast({ title: lang === "uz" ? "O'chirildi" : "Deleted" });
    },
  });

  const balance = (data?.totalIncome || 0) - (data?.totalExpense || 0);
  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200";
  const categories = ["order", "service", "salary", "rent", "inventory", "marketing", "other"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Moliyaviy hisobot" : lang === "ru" ? "\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0439 \u043e\u0442\u0447\u0451\u0442" : "Financial Report"}
        </h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={16} /> {lang === "uz" ? "Yangi tranzaksiya" : "New Transaction"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">{lang === "uz" ? "Kirim" : "Income"}</span>
          </div>
          <div className="text-2xl font-bold text-green-800">{(data?.totalIncome || 0).toLocaleString()} UZS</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-semibold text-red-700">{lang === "uz" ? "Chiqim" : "Expense"}</span>
          </div>
          <div className="text-2xl font-bold text-red-800">{(data?.totalExpense || 0).toLocaleString()} UZS</div>
        </div>
        <div className={`bg-gradient-to-br rounded-xl border p-5 ${balance >= 0 ? "from-blue-50 to-blue-100 border-blue-200" : "from-orange-50 to-orange-100 border-orange-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-5 h-5 ${balance >= 0 ? "text-blue-600" : "text-orange-600"}`} />
            <span className={`text-sm font-semibold ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>{lang === "uz" ? "Balans" : "Balance"}</span>
          </div>
          <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-800" : "text-orange-800"}`}>{balance.toLocaleString()} UZS</div>
        </div>
      </div>

      {products && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3">{lang === "uz" ? "Mahsulotlar holati" : "Product Inventory"}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-xs text-gray-500">{lang === "uz" ? "Jami" : "Total"}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{products.filter(p => p.inStock).length}</div>
              <div className="text-xs text-green-600">{lang === "uz" ? "Mavjud" : "In Stock"}</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{products.filter(p => !p.inStock).length}</div>
              <div className="text-xs text-red-600">{lang === "uz" ? "Tugagan" : "Out of Stock"}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</div>
              <div className="text-xs text-blue-600">{lang === "uz" ? "Umumiy qiymati (UZS)" : "Total Value (UZS)"}</div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createTx.mutate({ type: form.type, amount: parseInt(form.amount), description: form.description, category: form.category }); }}
          className="bg-white rounded-xl border border-blue-200 p-6 space-y-4">
          <h3 className="font-bold text-gray-900">{lang === "uz" ? "Yangi tranzaksiya" : "New Transaction"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{lang === "uz" ? "Turi" : "Type"}</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                <option value="income">{lang === "uz" ? "Kirim" : "Income"}</option>
                <option value="expense">{lang === "uz" ? "Chiqim" : "Expense"}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{lang === "uz" ? "Summa" : "Amount"}</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} required min="1" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{lang === "uz" ? "Kategoriya" : "Category"}</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{lang === "uz" ? "Izoh" : "Description"}</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createTx.isPending} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {createTx.isPending && <Loader2 size={14} className="animate-spin" />}
              {lang === "uz" ? "Saqlash" : "Save"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">{lang === "uz" ? "Bekor qilish" : "Cancel"}</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {["", "income", "expense"].map((f) => (
          <button key={f} onClick={() => { setTypeFilter(f); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${typeFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f === "" ? (lang === "uz" ? "Barchasi" : "All") : f === "income" ? (lang === "uz" ? "Kirim" : "Income") : (lang === "uz" ? "Chiqim" : "Expense")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="p-3 font-bold">{lang === "uz" ? "Sana" : "Date"}</th>
                <th className="p-3 font-bold">{lang === "uz" ? "Turi" : "Type"}</th>
                <th className="p-3 font-bold">{lang === "uz" ? "Kategoriya" : "Category"}</th>
                <th className="p-3 font-bold">{lang === "uz" ? "Izoh" : "Description"}</th>
                <th className="p-3 font-bold text-right">{lang === "uz" ? "Summa" : "Amount"}</th>
                <th className="p-3 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${tx.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {tx.type === "income" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {tx.type === "income" ? (lang === "uz" ? "Kirim" : "Income") : (lang === "uz" ? "Chiqim" : "Expense")}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 capitalize">{tx.category}</td>
                  <td className="p-3 text-sm text-gray-700">{tx.description}</td>
                  <td className={`p-3 text-sm font-bold text-right ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "income" ? "+" : "-"}{tx.amount.toLocaleString()} UZS
                  </td>
                  <td className="p-3">
                    <button onClick={() => deleteTx.mutate(tx.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {(!data?.transactions || data.transactions.length === 0) && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400 text-sm">{lang === "uz" ? "Tranzaksiyalar yo'q" : "No transactions"}</td></tr>
              )}
            </tbody>
          </table>

          {data && data.total > data.pageSize && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50">{"\u2190"}</button>
              <span className="text-sm text-gray-600">{page} / {Math.ceil(data.total / data.pageSize)}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(data.total / data.pageSize)} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50">{"\u2192"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
