import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env";
import router from "./routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/error";

export function createApp(): express.Application {
  const app = express();

  // ── Security ─────────────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // ── CORS ─────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: [
        env.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ── Logging ──────────────────────────────────────────────────────────────────
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // ── Body parsing ──────────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ── Static file serving (uploaded files) ──────────────────────────────────────
  app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

  // ── API Routes ────────────────────────────────────────────────────────────────
  app.use("/api", router);

  // ── 404 & Global error handler ────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
