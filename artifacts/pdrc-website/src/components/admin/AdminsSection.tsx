import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Check, X, ShieldCheck, ShieldOff, UserX, UserCheck } from "lucide-react";

interface AdminUser {
  id: number; name: string; email: string; phone: string | null;
  role: string; isActive: boolean; permissions: Record<string, boolean> | null; createdAt: string;
}

const ALL_PERMISSIONS = [
  { key: "dashboard", label: { uz: "Boshqaruv paneli", en: "Dashboard", ru: "Панель" } },
  { key: "orders", label: { uz: "Buyurtmalar", en: "Orders", ru: "Заказы" } },
  { key: "messages", label: { uz: "Xabarlar", en: "Messages", ru: "Сообщения" } },
  { key: "bookings", label: { uz: "Bronlar", en: "Bookings", ru: "Брони" } },
  { key: "products", label: { uz: "Mahsulotlar", en: "Products", ru: "Товары" } },
  { key: "services", label: { uz: "Xizmatlar", en: "Services", ru: "Услуги" } },
  { key: "courses", label: { uz: "Kurslar", en: "Courses", ru: "Курсы" } },
  { key: "articles", label: { uz: "Maqolalar", en: "Articles", ru: "Статьи" } },
  { key: "gallery", label: { uz: "Galereya", en: "Gallery", ru: "Галерея" } },
  { key: "reviews", label: { uz: "Sharhlar", en: "Reviews", ru: "Отзывы" } },
  { key: "advertisements", label: { uz: "Reklamalar", en: "Ads", ru: "Реклама" } },
  { key: "finances", label: { uz: "Moliya", en: "Finances", ru: "Финансы" } },
  { key: "admins", label: { uz: "Adminlar", en: "Admins", ru: "Админы" } },
  { key: "settings", label: { uz: "Sozlamalar", en: "Settings", ru: "Настройки" } },
];

function PermissionsGrid({
  perms, onChange,
}: { perms: Record<string, boolean>; onChange: (p: Record<string, boolean>) => void }) {
  const { lang } = useAppStore();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {ALL_PERMISSIONS.map((perm) => (
        <label key={perm.key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
          <input type="checkbox" checked={perms[perm.key] || false}
            onChange={(e) => onChange({ ...perms, [perm.key]: e.target.checked })}
            className="w-4 h-4 accent-blue-600" />
          <span className="text-sm text-gray-700">{perm.label[lang as keyof typeof perm.label] || perm.label.en}</span>
        </label>
      ))}
    </div>
  );
}

export function AdminsSection() {
  const { lang, user: currentUser } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [newPerms, setNewPerms] = useState<Record<string, boolean>>({});

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPerms, setEditPerms] = useState<Record<string, boolean>>({});

  const [promotingId, setPromotingId] = useState<number | null>(null);
  const [promotePerms, setPromotePerms] = useState<Record<string, boolean>>({});

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
      setForm({ name: "", email: "", password: "", phone: "" });
      setNewPerms({});
      toast({ title: lang === "uz" ? "Admin qo'shildi" : "Admin added" });
    },
    onError: (err: Error) => toast({ variant: "destructive", title: err.message || "Error" }),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingId(null);
      setPromotingId(null);
      toast({ title: lang === "uz" ? "Yangilandi" : "Updated" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const admins = users?.filter((u) => u.role === "admin" || u.role === "superadmin") || [];
  const regularUsers = users?.filter((u) => u.role === "user") || [];

  function startEditPerms(user: AdminUser) {
    setPromotingId(null);
    setEditingId(user.id);
    setEditPerms(user.permissions || {});
  }

  function startPromote(user: AdminUser) {
    setEditingId(null);
    setPromotingId(user.id);
    setPromotePerms({});
  }

  function demoteToUser(id: number) {
    if (!confirm(lang === "uz" ? "Bu adminni oddiy foydalanuvchiga aylantirmoqchimisiz?" : "Demote this admin to a regular user?")) return;
    updateUser.mutate({ id, role: "user", permissions: null });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Admin boshqaruvi" : lang === "ru" ? "Управление админами" : "Admin Management"}
        </h1>
        {isSuperAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors">
            <UserPlus size={16} /> {lang === "uz" ? "Yangi admin qo'shish" : "Add Admin"}
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
          {lang === "uz" ? "Superadmin sizga bu huquqni bermagan. Faqat ko'rish mumkin." : "View only — superadmin access required."}
        </div>
      )}

      {showForm && isSuperAdmin && (
        <form onSubmit={(e) => {
          e.preventDefault();
          createUser.mutate({ ...form, role: "admin", permissions: newPerms });
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
            <PermissionsGrid perms={newPerms} onChange={setNewPerms} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createUser.isPending} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {createUser.isPending && <Loader2 size={14} className="animate-spin" />}
              {lang === "uz" ? "Qo'shish" : "Add"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">
              {lang === "uz" ? "Bekor qilish" : "Cancel"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-600" />
              {lang === "uz" ? "Adminlar" : "Admins"} ({admins.length})
            </h2>
            {admins.length === 0 && (
              <p className="text-sm text-gray-400 italic">{lang === "uz" ? "Adminlar yo'q" : "No admins"}</p>
            )}
            {admins.map((admin) => (
              <div key={admin.id} className={`bg-white rounded-xl border p-5 ${!admin.isActive ? "opacity-60 border-red-200" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{admin.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${admin.role === "superadmin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {admin.role}
                      </span>
                      {!admin.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
                          {lang === "uz" ? "Nofaol" : "Inactive"}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{admin.email}{admin.phone && ` | ${admin.phone}`}</div>
                  </div>

                  {isSuperAdmin && admin.id !== currentUser?.id && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {admin.role === "admin" && (
                        <>
                          <button onClick={() => startEditPerms(admin)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            {lang === "uz" ? "Huquqlar" : "Permissions"}
                          </button>
                          <button onClick={() => demoteToUser(admin.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                            <ShieldOff size={12} />
                            {lang === "uz" ? "Adminlikdan chiqarish" : "Remove Admin"}
                          </button>
                        </>
                      )}
                      <button onClick={() => updateUser.mutate({ id: admin.id, isActive: !admin.isActive })}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${admin.isActive ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-green-600 bg-green-50 hover:bg-green-100"}`}>
                        {admin.isActive
                          ? <><UserX size={12} />{lang === "uz" ? "Bloklash" : "Block"}</>
                          : <><UserCheck size={12} />{lang === "uz" ? "Faollashtirish" : "Activate"}</>}
                      </button>
                    </div>
                  )}
                </div>

                {editingId === admin.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                      {lang === "uz" ? "Huquqlarni tahrirlash" : "Edit Permissions"}
                    </p>
                    <PermissionsGrid perms={editPerms} onChange={setEditPerms} />
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => updateUser.mutate({ id: admin.id, permissions: editPerms })}
                        disabled={updateUser.isPending}
                        className="flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">
                        {updateUser.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        {lang === "uz" ? "Saqlash" : "Save"}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">
                        <X size={12} /> {lang === "uz" ? "Bekor qilish" : "Cancel"}
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

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserCheck size={20} className="text-gray-500" />
              {lang === "uz" ? "Foydalanuvchilar" : "Users"} ({regularUsers.length})
            </h2>
            {regularUsers.length === 0 && (
              <p className="text-sm text-gray-400 italic">{lang === "uz" ? "Foydalanuvchilar yo'q" : "No users"}</p>
            )}
            {regularUsers.map((u) => (
              <div key={u.id} className={`bg-white rounded-xl border p-4 ${!u.isActive ? "opacity-60 border-red-200" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900">{u.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500">user</span>
                      {!u.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
                          {lang === "uz" ? "Bloklangan" : "Blocked"}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{u.email}{u.phone && ` | ${u.phone}`}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button onClick={() => startPromote(u)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <ShieldCheck size={12} />
                        {lang === "uz" ? "Admin qilish" : "Make Admin"}
                      </button>
                      <button onClick={() => updateUser.mutate({ id: u.id, isActive: !u.isActive })}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${u.isActive ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-green-600 bg-green-50 hover:bg-green-100"}`}>
                        {u.isActive
                          ? <><UserX size={12} />{lang === "uz" ? "Bloklash" : "Block"}</>
                          : <><UserCheck size={12} />{lang === "uz" ? "Faollashtirish" : "Unblock"}</>}
                      </button>
                    </div>
                  )}
                </div>

                {promotingId === u.id && (
                  <div className="mt-4 pt-4 border-t border-blue-100 bg-blue-50/40 rounded-lg px-3 pb-3">
                    <p className="text-xs font-bold text-blue-700 uppercase mb-3 flex items-center gap-1">
                      <ShieldCheck size={12} />
                      {lang === "uz" ? `${u.name}ni admin qilish — huquqlarni tanlang` : `Make ${u.name} admin — select permissions`}
                    </p>
                    <PermissionsGrid perms={promotePerms} onChange={setPromotePerms} />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => updateUser.mutate({ id: u.id, role: "admin", permissions: promotePerms })}
                        disabled={updateUser.isPending}
                        className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {updateUser.isPending ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                        {lang === "uz" ? "Admin qilish" : "Confirm"}
                      </button>
                      <button onClick={() => setPromotingId(null)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">
                        <X size={12} /> {lang === "uz" ? "Bekor qilish" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
