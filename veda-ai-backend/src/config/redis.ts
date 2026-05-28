import { createClient } from "redis";
import { env } from "./env";

// ✅ FIXED Redis health check
export async function pingRedis(): Promise<boolean> {
  const client = createClient({
    url: env.REDIS_URL,
  });

  try {
    await client.connect();
    await client.ping();
    await client.disconnect();
    return true;
  } catch (err) {
    console.error("[Redis Ping Error]", err);
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  // No-op (BullMQ handles connections)
}