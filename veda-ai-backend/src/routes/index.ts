import { Router } from "express";
import assignmentRoutes from "./assignment.routes";
import { healthCheck } from "../controllers/health.controller";

const router = Router();

router.get("/health", healthCheck);
router.use("/assignments", assignmentRoutes);

export default router;
