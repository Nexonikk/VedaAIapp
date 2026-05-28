import { Request, Response } from "express";
import { asyncHandler, AppError } from "@/middleware/error";
import * as assignmentService from "@/services/assignment.service";
import * as jobService from "@/services/job.service";
import { createAssignmentSchema } from "@/lib/schemas";
import type { AssessmentJobData } from "@/config/queue";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const assignments = await assignmentService.getAllAssignments();
  res.json({ success: true, data: assignments });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const assignment = await assignmentService.getAssignmentById(id);
  res.json({ success: true, data: assignment });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  let questionTypes;
  try {
    questionTypes = JSON.parse(req.body.questionTypes || "[]");
  } catch {
    throw new AppError("Invalid questionTypes — must be a JSON array", 400);
  }

  const parsed = createAssignmentSchema.safeParse({
    title: req.body.title,
    dueDate: req.body.dueDate,
    questionTypes,
    additionalInfo: req.body.additionalInfo,
  });

  if (!parsed.success) {
    throw new AppError(
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      400
    );
  }

  const filePath = (req.file as Express.Multer.File | undefined)?.path;

  const { id: assignmentId } = await assignmentService.createAssignment({
    ...parsed.data,
    filePath,
  });

  const jobData: AssessmentJobData = {
    assignmentId,
    title: parsed.data.title,
    dueDate: parsed.data.dueDate,
    questionTypes: parsed.data.questionTypes,
    additionalInfo: parsed.data.additionalInfo,
    filePath,
  };

  const { bullJobId } = await jobService.enqueueAssessmentJob(assignmentId, jobData);

  res.status(201).json({
    success: true,
    data: {
      assignmentId,
      jobId: bullJobId,
      message: "Assignment created and queued for AI generation",
    },
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await assignmentService.deleteAssignment(String(req.params.id));
  res.json({ success: true, message: "Assignment deleted" });
});

export const getOutput = asyncHandler(async (req: Request, res: Response) => {
  const output = await assignmentService.getAssignmentOutput(String(req.params.id));
  res.json({ success: true, data: output });
});

export const regenerate = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const { prisma } = await import("@/config/database");
  const full = await prisma.assignment.findUnique({
    where: { id },
    include: { questionTypeConfig: true },
  });
  if (!full) throw new AppError("Assignment not found", 404);

  const jobData: AssessmentJobData = {
    assignmentId: id,
    title: full.title,
    dueDate: full.dueDate.toISOString(),
    questionTypes: full.questionTypeConfig.map((q: {questionType:string;noOfQuestions:number;marksPerQuestion:number}) => ({
      type: q.questionType,
      noOfQuestions: q.noOfQuestions,
      marksPerQuestion: q.marksPerQuestion,
    })),
    additionalInfo: full.additionalInfo || undefined,
    filePath: full.filePath || undefined,
  };

  const { bullJobId } = await jobService.enqueueAssessmentJob(id, jobData);

  res.json({
    success: true,
    data: { assignmentId: id, jobId: bullJobId, message: "Regeneration queued" },
  });
});

export const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getJobByAssignmentId(String(req.params.id));
  if (!job) throw new AppError("No job found for this assignment", 404);
  res.json({ success: true, data: job });
});
