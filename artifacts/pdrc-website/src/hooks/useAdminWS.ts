import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";

export type WsEventType = "new_order" | "new_message" | "new_booking" | "order_status" | "connected";

interface WsEvent {
  type: WsEventType;
  payload: Record<string, unknown>;
}

export function useAdminWS(enabled: boolean) {
  const wsRef = useRef<WebSocket | null>(null);
  const { token } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (!enabled || !token) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const apiBase = import.meta.env.VITE_API_URL || "";
    const wsBase = apiBase ? apiBase.replace(/^https?:/, proto) : `${proto}//${window.location.hostname}:8080`;
    const url = `${wsBase}/ws`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const event: WsEvent = JSON.parse(e.data);
        switch (event.type) {
          case "new_order":
            qc.invalidateQueries({ queryKey: ["admin-stats"] });
            qc.invalidateQueries({ queryKey: ["admin-orders"] });
            toast({
              title: "🛒 Yangi buyurtma!",
              description: `${event.payload.fullName || ""} — ${Number(event.payload.total || 0).toLocaleString()} UZS`,
            });
            break;
          case "new_message":
            qc.invalidateQueries({ queryKey: ["admin-stats"] });
            qc.invalidateQueries({ queryKey: ["admin-messages"] });
            toast({
              title: "✉️ Yangi xabar!",
              description: `${event.payload.name || ""}: ${event.payload.subject || ""}`,
            });
            break;
          case "new_booking":
            qc.invalidateQueries({ queryKey: ["admin-stats"] });
            qc.invalidateQueries({ queryKey: ["admin-bookings"] });
            toast({ title: "📅 Yangi bron!", description: `${event.payload.name || ""}` });
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setTimeout(() => connect(), 5000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [enabled, token, qc, toast]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);
}
