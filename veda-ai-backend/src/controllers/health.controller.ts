import { Request, Response } from "express";
import { prisma } from "../config/database";
import { pingRedis } from "../config/redis";
import { env } from "../config/env";

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const checks: Record<string, "ok" | "error"> = { server: "ok", database: "ok", redis: "ok" };

  try { await prisma.$queryRaw`SELECT 1`; } catch { checks.database = "error"; }
  try { const ok = await pingRedis(); if (!ok) checks.redis = "error"; } catch { checks.redis = "error"; }

  const allOk = Object.values(checks).every((v) => v === "ok");
  res.status(allOk ? 200 : 503).json({
    success: allOk,
    status: allOk ? "healthy" : "degraded",
    version: "1.0.0",
    environment: env.NODE_ENV,
    checks,
    timestamp: new Date().toISOString(),
  });
}
