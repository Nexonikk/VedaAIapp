import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "http";
import type { WSMessage } from "../types";

const jobClients = new Map<string, Set<WebSocket>>();

export function initWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || "", `http://localhost`);
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      ws.close(1008, "jobId query param required");
      return;
    }

    // Register client for this job
    if (!jobClients.has(jobId)) jobClients.set(jobId, new Set());
    jobClients.get(jobId)!.add(ws);
    console.log(`[WS] Client connected for job ${jobId}`);

    ws.on("close", () => {
      jobClients.get(jobId)?.delete(ws);
      if (jobClients.get(jobId)?.size === 0) jobClients.delete(jobId);
      console.log(`[WS] Client disconnected from job ${jobId}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error on job ${jobId}:`, err.message);
    });

    // Confirm connection
    sendToJob(jobId, { type: "JOB_QUEUED", jobId, message: "Connected to job stream" });
  });

  wss.on("error", (err) => console.error("[WS] Server error:", err));
  console.log("✅ WebSocket server initialized on /ws");
  return wss;
}

export function sendToJob(jobId: string, message: WSMessage): void {
  const clients = jobClients.get(jobId);
  if (!clients || clients.size === 0) return;

  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function broadcastProgress(
  jobId: string,
  progress: number,
  message: string
): void {
  sendToJob(jobId, { type: "PROGRESS_UPDATE", jobId, progress, message });
}
