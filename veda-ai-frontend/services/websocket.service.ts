import { APP_CONFIG } from "@/config/constants";
import type { WSMessage } from "@/types";

type MessageHandler = (msg: WSMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private jobId: string | null = null;

  connect(jobId: string) {
    this.jobId = jobId;
    this.disconnect();

    try {
      this.ws = new WebSocket(`${APP_CONFIG.wsUrl}/ws?jobId=${jobId}`);

      this.ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          this.handlers.forEach((h) => h(msg));
        } catch {
          console.warn("[WS] Failed to parse message", event.data);
        }
      };

      this.ws.onclose = () => {
        if (this.jobId) {
          this.reconnectTimer = setTimeout(() => this.connect(this.jobId!), 3000);
        }
      };

      this.ws.onerror = (e) => {
        console.warn("[WS] Error:", e);
      };
    } catch (err) {
      console.warn("[WS] Could not connect:", err);
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.jobId = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

export const wsService = new WebSocketService();
