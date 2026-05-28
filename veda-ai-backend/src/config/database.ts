import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log("✅ PostgreSQL connected via Prisma");
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  console.log("🔌 PostgreSQL disconnected");
}
