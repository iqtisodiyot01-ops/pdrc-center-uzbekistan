import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "./logger";

let wss: WebSocketServer | null = null;

export type WsEventType = "new_order" | "new_message" | "new_booking" | "order_status";

export interface WsEvent {
  type: WsEventType;
  payload: Record<string, unknown>;
}

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    logger.info("WebSocket client connected");
    ws.send(JSON.stringify({ type: "connected", payload: {} }));

    ws.on("error", (err) => logger.warn({ err }, "WebSocket client error"));
    ws.on("close", () => logger.info("WebSocket client disconnected"));
  });

  logger.info("WebSocket server initialized at /ws");
}

export function broadcast(event: WsEvent) {
  if (!wss) return;
  const msg = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
