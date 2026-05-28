import "dotenv/config";
import { Worker, Job } from "bullmq";
import { QUEUE_NAMES, type AssessmentJobData, type AssessmentJobResult, getConnectionConfig } from "@/config/queue";
import { generateAssessment } from "@/lib/ai";
import { saveGeneratedOutput, updateAssignmentStatus } from "@/services/assignment.service";
import { updateJobStatus } from "@/services/job.service";
import { sendToJob } from "@/lib/websocket";

async function processAssessmentJob(
  job: Job<AssessmentJobData, AssessmentJobResult>
): Promise<AssessmentJobResult> {
  const { assignmentId, title, questionTypes, additionalInfo } = job.data;
  const bullJobId = job.id!;

  console.log(`[Worker] Processing job ${bullJobId} for assignment ${assignmentId}`);

  try {
    await updateJobStatus(assignmentId, "PROCESSING", 10);
    sendToJob(bullJobId, { type: "JOB_PROCESSING", jobId: bullJobId, progress: 10, message: "Structuring prompt..." });

    await job.updateProgress(30);
    sendToJob(bullJobId, { type: "PROGRESS_UPDATE", jobId: bullJobId, progress: 30, message: "Calling AI model..." });
    await updateJobStatus(assignmentId, "PROCESSING", 30);

    const aiPaper = await generateAssessment({ title, questionTypes, additionalInfo });

    await job.updateProgress(70);
    sendToJob(bullJobId, { type: "PROGRESS_UPDATE", jobId: bullJobId, progress: 70, message: "Saving to database..." });
    await updateJobStatus(assignmentId, "PROCESSING", 70);

    const output = await saveGeneratedOutput(assignmentId, aiPaper);
    await updateAssignmentStatus(assignmentId, "COMPLETED");

    await job.updateProgress(95);
    sendToJob(bullJobId, { type: "PROGRESS_UPDATE", jobId: bullJobId, progress: 95, message: "Finalising..." });

    await updateJobStatus(assignmentId, "COMPLETED", 100);
    sendToJob(bullJobId, {
      type: "JOB_COMPLETED",
      jobId: bullJobId,
      progress: 100,
      message: "Assignment generated successfully!",
      payload: output,
    });

    console.log(`[Worker] ✅ Job ${bullJobId} completed`);
    return { success: true, assignmentId, outputId: output.assignmentId };
  } catch (err) {
    const message = (err as Error).message || "Unknown error";
    console.error(`[Worker] ❌ Job ${bullJobId} failed:`, message);
    await updateJobStatus(assignmentId, "FAILED", 0, message).catch(() => {});
    sendToJob(bullJobId, { type: "JOB_FAILED", jobId: bullJobId, message: `Generation failed: ${message}` });
    throw err;
  }
}

export function startWorker(): Worker<AssessmentJobData, AssessmentJobResult> {
  const worker = new Worker<AssessmentJobData, AssessmentJobResult>(
    QUEUE_NAMES.ASSESSMENT_GENERATION,
    processAssessmentJob,
    { connection: getConnectionConfig() as never, concurrency: 3 }
  );
  worker.on("completed", (job) => console.log(`[Worker] ✅ ${job.id} done`));
  worker.on("failed", (job, err) => console.error(`[Worker] ❌ ${job?.id}:`, err.message));
  worker.on("error", (err) => console.error("[Worker]", err.message));
  console.log("✅ Assessment worker started");
  return worker;
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { prisma } = require("@/config/database");
  prisma.$connect().then(() => {
    const worker = startWorker();
    const shutdown = async () => { await worker.close(); await prisma.$disconnect(); process.exit(0); };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  });
}
