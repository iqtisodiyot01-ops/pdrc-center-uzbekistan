import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Trash2, Eye, Loader2 } from "lucide-react";

interface Message {
  id: number; name: string; email: string | null; phone: string | null;
  subject: string | null; message: string; reply: string | null;
  isRead: boolean; createdAt: string;
}

export function MessagesSection() {
  const { lang } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["admin-messages"],
    queryFn: () => api.get<Message[]>("/admin/messages"),
  });

  const markRead = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/messages/${id}`, { isRead: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const sendReply = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) => api.patch(`/admin/messages/${id}`, { reply, isRead: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setReplyText("");
      toast({ title: lang === "uz" ? "Javob yuborildi" : "Reply sent" });
    },
    onError: () => toast({ variant: "destructive", title: "Error" }),
  });

  const deleteMsg = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      if (selectedId) setSelectedId(null);
      toast({ title: lang === "uz" ? "O'chirildi" : "Deleted" });
    },
  });

  const filtered = messages?.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "replied") return !!m.reply;
    return true;
  }) || [];

  const selected = messages?.find((m) => m.id === selectedId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === "uz" ? "Xabarlar" : lang === "ru" ? "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f" : "Messages"}
        </h1>
        <div className="flex gap-2">
          {(["all", "unread", "replied"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f === "all" ? (lang === "uz" ? "Barchasi" : "All") : f === "unread" ? (lang === "uz" ? "O'qilmagan" : "Unread") : (lang === "uz" ? "Javob berilgan" : "Replied")}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filtered.map((msg) => (
                <div key={msg.id}
                  onClick={() => {
                    setSelectedId(msg.id);
                    if (!msg.isRead) markRead.mutate(msg.id);
                  }}
                  className={`p-4 cursor-pointer transition-colors ${selectedId === msg.id ? "bg-blue-50 border-l-4 border-blue-600" : "hover:bg-gray-50 border-l-4 border-transparent"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    <span className={`font-semibold text-sm ${!msg.isRead ? "text-gray-900" : "text-gray-600"}`}>{msg.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  {msg.subject && <div className="text-sm text-gray-700 font-medium truncate">{msg.subject}</div>}
                  <div className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</div>
                  {msg.reply && <div className="text-[10px] text-green-600 font-semibold mt-1">{lang === "uz" ? "Javob berilgan" : "Replied"}</div>}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-sm">{lang === "uz" ? "Xabarlar yo'q" : "No messages"}</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{selected.name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                      {selected.email && <span>{selected.email}</span>}
                      {selected.phone && <span className="font-mono">{selected.phone}</span>}
                      <span>{new Date(selected.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteMsg.mutate(selected.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                {selected.subject && (
                  <div className="px-5 pt-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{lang === "uz" ? "Mavzu" : "Subject"}</span>
                    <p className="text-gray-900 font-medium mt-1">{selected.subject}</p>
                  </div>
                )}

                <div className="p-5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{lang === "uz" ? "Xabar" : "Message"}</span>
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>

                {selected.reply && (
                  <div className="mx-5 mb-5 p-4 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{lang === "uz" ? "Javob" : "Reply"}</span>
                    <p className="text-green-800 mt-1 whitespace-pre-wrap">{selected.reply}</p>
                  </div>
                )}

                <div className="p-5 pt-0">
                  <div className="flex gap-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={lang === "uz" ? "Javob yozing..." : "Write a reply..."}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 h-24"
                    />
                  </div>
                  <button
                    onClick={() => { if (replyText.trim()) sendReply.mutate({ id: selected.id, reply: replyText.trim() }); }}
                    disabled={!replyText.trim() || sendReply.isPending}
                    className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {sendReply.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {lang === "uz" ? "Javob yuborish" : "Send Reply"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center h-64 text-gray-400">
                <MessageSquare size={40} className="mb-3 opacity-30" />
                <p className="text-sm">{lang === "uz" ? "Xabarni tanlang" : "Select a message"}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
