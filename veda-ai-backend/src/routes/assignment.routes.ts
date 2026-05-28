import { Router } from "express";
import * as controller from "../controllers/assignment.controller";
import { upload } from "../middleware/upload";

const router = Router();

// GET  /api/assignments
router.get("/", controller.getAll);

// GET  /api/assignments/:id
router.get("/:id", controller.getById);

// POST /api/assignments  — multipart form with optional file
router.post("/", upload.single("file"), controller.create);

// DELETE /api/assignments/:id
router.delete("/:id", controller.remove);

// GET  /api/assignments/:id/output
router.get("/:id/output", controller.getOutput);

// POST /api/assignments/:id/regenerate
router.post("/:id/regenerate", controller.regenerate);

// GET  /api/assignments/:id/job
router.get("/:id/job", controller.getJobStatus);

export default router;
