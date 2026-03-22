import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, Loader2, UserPlus, Check, X } from "lucide-react";

interface AdminUser {
  id: number; name: string; email: string; phone: string | null;
  role: string; isActive: boolean; permissions: Record<string, boolean> | null; createdAt: string;
}

const ALL_PERMISSIONS = [
  { key: "dashboard", label: { uz: "Boshqaruv paneli", en: "Dashboard", ru: "\u041f\u0430\u043d\u0435\u043b\u044c" } },
  { key: "orders", label: { uz: "Buyurtmalar", en: "Orders", ru: "\u0417\u0430\u043a\u0430\u0437\u044b" } },
  { key: "messages", label: { uz: "Xabarlar", en: "Messages", ru: "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f" } },
  { key: "bookings", label: { uz: "Bronlar", en: "Bookings", ru: "\u0411\u0440\u043e\u043d\u0438" } },
  { key: "products", label: { uz: "Mahsulotlar", en: "Products", ru: "\u0422\u043e\u0432\u0430\u0440\u044b" } },
  { key: "services", label: { uz: "Xizmatlar", en: "Services", ru: "\u0423\u0441\u043b\u0443\u0433\u0438" } },
  { key: "courses", label: { uz: "Kurslar", en: "Courses", ru: "\u041a\u0443\u0440\u0441\u044b" } },
  { key: "articles", label: { uz: "Maqolalar", en: "Articles", ru: "\u0421\u0442\u0430\u0442\u044c\u0438" } },
  { key: "gallery", label: { uz: "Galereya", en: "Gallery", ru: "\u0413\u0430\u043b\u0435\u0440\u0435\u044f" } },
  { key: "reviews", label: { uz: "Sharhlar", en: "Reviews", ru: "\u041e\u0442\u0437\u044b\u0432\u044b" } },
  { key: "advertisements", label: { uz: "Reklamalar", en: "Ads", ru: "\u0420\u0435\u043a\u043b\u0430\u043c\u0430" } },
  { key: "finances", label: { uz: "Moliya", en: "Finances", ru: "\u0424\u0438\u043d\u0430\u043d\u0441\u044b" } },
  { key: "admins", label: { uz: "Adminlar", en: "Admins", ru: "\u0410\u0434\u043c\u0438\u043d\u044b" } },
  { key: "settings", label: { uz: "Sozlamalar", en: "Settings", ru: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438" } },
];

export function AdminsSection() {
  const { lang, user: currentUser } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPerms, setEditPerms] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "admin" as string });
  const [newPerms, setNewPerms] = useState<Record<string, boolean>>({});

  const isSuperAdmin = currentUser?.role === "superadmin";

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: () => api.get<AdminUser[]>("/admin/users"),
  });

  const createUser = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowForm(false);
      setForm({ name: "", email: "", password: "", phone: "", role: "admin" });
      setNewPerms({});
      toast({ title: lang === "uz" ? "Admin qo'shildi" : "Admin added" });
    },
    onError: (err: Error) => toast({ variant: "destructive", title: err.message || "Error" }),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingId(null);
      toast({ title: lang === "uz" ? "Yangilandi" : "Updated" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: lang === "uz" ? "O'chirildi" : "Deleted" });
    },
  });

  const admins = users?.filter((u) => u.role === "admin" || u.role === "superadmin") || [];
  const regularUsers = users?.filter((u) => u.role === "user") || [];

  function startEditPerms(user: AdminUser) {
    setEditingId(user.id);
    setEditPerms(user.permissions || {});
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Admin boshqaruvi" : lang === "ru" ? "\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0430\u0434\u043c\u0438\u043d\u0430\u043c\u0438" : "Admin Management"}
        </h1>
        {isSuperAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors">
            <UserPlus size={16} /> {lang === "uz" ? "Admin qo'shish" : "Add Admin"}
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
          {lang === "uz"
            ? "Superadmin sizga bu huquqni bermagan. Faqat ko'rish mumkin."
            : "The superadmin has not granted you this permission. View only."}
        </div>
      )}

      {showForm && isSuperAdmin && (
        <form onSubmit={(e) => {
          e.preventDefault();
          createUser.mutate({ ...form, permissions: newPerms });
        }} className="bg-white rounded-xl border border-blue-200 p-6 space-y-4">
          <h3 className="font-bold text-gray-900">{lang === "uz" ? "Yangi admin" : "New Admin"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{lang === "uz" ? "Ism" : "Name"}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{lang === "uz" ? "Parol" : "Password"}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{lang === "uz" ? "Telefon" : "Phone"}</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{lang === "uz" ? "Huquqlar" : "Permissions"}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm.key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <input type="checkbox" checked={newPerms[perm.key] || false}
                    onChange={(e) => setNewPerms({ ...newPerms, [perm.key]: e.target.checked })}
                    className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm text-gray-700">{perm.label[lang as keyof typeof perm.label] || perm.label.en}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createUser.isPending} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {createUser.isPending && <Loader2 size={14} className="animate-spin" />}
              {lang === "uz" ? "Qo'shish" : "Add"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">{lang === "uz" ? "Bekor qilish" : "Cancel"}</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : (
        <>
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {lang === "uz" ? "Adminlar" : "Admins"} ({admins.length})
            </h2>
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className={`bg-white rounded-xl border p-5 ${!admin.isActive ? "opacity-50 border-red-200" : "border-gray-200"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{admin.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${admin.role === "superadmin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {admin.role}
                        </span>
                        {!admin.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">{lang === "uz" ? "Nofaol" : "Inactive"}</span>}
                      </div>
                      <div className="text-sm text-gray-500">{admin.email} {admin.phone && `| ${admin.phone}`}</div>
                    </div>
                    {isSuperAdmin && admin.id !== currentUser?.id && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEditPerms(admin)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          {lang === "uz" ? "Huquqlar" : "Permissions"}
                        </button>
                        <button onClick={() => updateUser.mutate({ id: admin.id, isActive: !admin.isActive })}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${admin.isActive ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-green-600 bg-green-50 hover:bg-green-100"}`}>
                          {admin.isActive ? (lang === "uz" ? "O'chirish" : "Deactivate") : (lang === "uz" ? "Faollashtirish" : "Activate")}
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === admin.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">{lang === "uz" ? "Huquqlarni tahrirlash" : "Edit Permissions"}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                        {ALL_PERMISSIONS.map((perm) => (
                          <label key={perm.key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                            <input type="checkbox" checked={editPerms[perm.key] || false}
                              onChange={(e) => setEditPerms({ ...editPerms, [perm.key]: e.target.checked })}
                              className="w-4 h-4 accent-blue-600" />
                            <span className="text-sm text-gray-700">{perm.label[lang as keyof typeof perm.label] || perm.label.en}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateUser.mutate({ id: admin.id, permissions: editPerms })}
                          className="flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700">
                          <Check size={14} /> {lang === "uz" ? "Saqlash" : "Save"}
                        </button>
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">
                          <X size={14} /> {lang === "uz" ? "Bekor qilish" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}

                  {admin.role === "admin" && admin.permissions && editingId !== admin.id && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ALL_PERMISSIONS.map((perm) => (
                        <span key={perm.key} className={`px-2 py-0.5 rounded text-[10px] font-bold ${admin.permissions?.[perm.key] ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {perm.label[lang as keyof typeof perm.label] || perm.label.en}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {lang === "uz" ? "Foydalanuvchilar" : "Users"} ({regularUsers.length})
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="p-3 font-bold">{lang === "uz" ? "Ism" : "Name"}</th>
                    <th className="p-3 font-bold">Email</th>
                    <th className="p-3 font-bold">{lang === "uz" ? "Telefon" : "Phone"}</th>
                    <th className="p-3 font-bold">{lang === "uz" ? "Sana" : "Date"}</th>
                    <th className="p-3 font-bold">{lang === "uz" ? "Holat" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {regularUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="p-3 text-sm text-gray-600">{u.email}</td>
                      <td className="p-3 text-sm text-gray-600 font-mono">{u.phone || "-"}</td>
                      <td className="p-3 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {u.isActive ? (lang === "uz" ? "Faol" : "Active") : (lang === "uz" ? "Nofaol" : "Inactive")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
