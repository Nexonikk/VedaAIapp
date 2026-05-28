import { prisma } from "@/config/database";
import { getAssessmentQueue, type AssessmentJobData } from "@/config/queue";

export async function enqueueAssessmentJob(
  assignmentId: string,
  jobData: AssessmentJobData
): Promise<{ bullJobId: string; dbJobId: string }> {
  const queue = getAssessmentQueue();

  const bullJob = await queue.add("generate-assessment", jobData, {
    jobId: `assignment-${assignmentId}-${Date.now()}`,
  });

  const dbJob = await prisma.assignmentJob.create({
    data: {
      assignmentId,
      bullJobId: bullJob.id!,
      status: "QUEUED",
      progress: 0,
    },
  });

  return { bullJobId: bullJob.id!, dbJobId: dbJob.id };
}

export async function updateJobStatus(
  assignmentId: string,
  status: string,
  progress?: number,
  errorMessage?: string
): Promise<void> {
  await prisma.assignmentJob.updateMany({
    where: { assignmentId },
    data: {
      status: status as "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED",
      ...(progress !== undefined && { progress }),
      ...(errorMessage && { errorMessage }),
    },
  });
}

export async function getJobByAssignmentId(assignmentId: string) {
  return prisma.assignmentJob.findUnique({ where: { assignmentId } });
}
