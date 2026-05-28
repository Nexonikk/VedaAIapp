import "dotenv/config";
import http from "http";
import { createApp } from "./app";
import { env } from "@/config/env";
import { connectDB, disconnectDB } from "@/config/database";
import { closeQueues } from "@/config/queue";
import { initWebSocketServer } from "@/lib/websocket";
import { startWorker } from "@/workers/assessment.worker";
import type { Worker } from "bullmq";

let worker: Worker | null = null;

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  initWebSocketServer(server);
  worker = startWorker();

  server.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║          VedaAI Backend — Running            ║
╠══════════════════════════════════════════════╣
║  HTTP   : http://localhost:${env.PORT}/api        ║
║  WS     : ws://localhost:${env.PORT}/ws           ║
║  Health : http://localhost:${env.PORT}/api/health ║
║  Env    : ${env.NODE_ENV.padEnd(34)}║
╚══════════════════════════════════════════════╝
   
`);
});

console.log("REDIS_URL =", env.REDIS_URL);

  const shutdown = async (signal: string) => {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    server.close(async () => {
      await worker?.close();
      await closeQueues();
      await disconnectDB();
      console.log("✅ Shutdown complete");
      process.exit(0);
    });
    setTimeout(() => { console.error("Forced shutdown"); process.exit(1); }, 15_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("uncaughtException", (err) => { console.error("[UncaughtException]", err); shutdown("UncaughtException"); });
  process.on("unhandledRejection", (reason) => { console.error("[UnhandledRejection]", reason); shutdown("UnhandledRejection"); });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
