import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2, Trash2 } from "lucide-react";

interface Booking {
  id: number; name: string; phone: string; email: string | null;
  serviceId: number | null; message: string | null; status: string; createdAt: string;
}

export function BookingsSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: () => api.get<Booking[]>("/bookings"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.put(`/bookings/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast({ title: lang === "uz" ? "Yangilandi" : "Updated" }); },
  });

  const deleteBooking = useMutation({
    mutationFn: (id: number) => api.delete(`/bookings/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast({ title: lang === "uz" ? "O'chirildi" : "Deleted" }); },
  });

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-amber-100 text-amber-700 border-amber-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {lang === "uz" ? "Bronlar" : lang === "ru" ? "\u0411\u0440\u043e\u043d\u0438" : "Bookings"}
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="p-3 font-bold">{lang === "uz" ? "Sana" : "Date"}</th>
                <th className="p-3 font-bold">{lang === "uz" ? "Mijoz" : "Client"}</th>
                <th className="p-3 font-bold">{lang === "uz" ? "Telefon" : "Phone"}</th>
                <th className="p-3 font-bold">{lang === "uz" ? "Xabar" : "Message"}</th>
                <th className="p-3 font-bold">{lang === "uz" ? "Holat" : "Status"}</th>
                <th className="p-3 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings?.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-medium text-gray-900">{b.name}</td>
                  <td className="p-3 text-sm text-blue-600 font-mono">{b.phone}</td>
                  <td className="p-3 text-sm text-gray-500 max-w-xs truncate">{b.message || "-"}</td>
                  <td className="p-3">
                    <select value={b.status} onChange={(e) => updateStatus.mutate({ id: b.id, status: e.target.value })}
                      disabled={updateStatus.isPending}
                      className="bg-white border border-gray-200 text-sm rounded-lg p-1.5 focus:ring-blue-400 focus:border-blue-400 outline-none">
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button onClick={() => deleteBooking.mutate(b.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!bookings || bookings.length === 0) && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400 text-sm">{lang === "uz" ? "Bronlar yo'q" : "No bookings"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
