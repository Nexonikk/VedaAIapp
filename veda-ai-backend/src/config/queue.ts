import { Queue } from "bullmq";
import { env } from "@/config/env";

export const QUEUE_NAMES = {
  ASSESSMENT_GENERATION: "assessment-generation",
} as const;

export interface AssessmentJobData {
  assignmentId: string;
  title: string;
  dueDate: string;
  questionTypes: Array<{
    type: string;
    noOfQuestions: number;
    marksPerQuestion: number;
  }>;
  additionalInfo?: string;
  filePath?: string;
}

export interface AssessmentJobResult {
  success: boolean;
  assignmentId: string;
  outputId?: string;
  error?: string;
}

function getConnectionOpts() {
  return {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: {}, // REQUIRED for Upstash
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let assessmentQueue: Queue<AssessmentJobData, AssessmentJobResult> | null = null;

export function getAssessmentQueue(): Queue<AssessmentJobData, AssessmentJobResult> {
  if (!assessmentQueue) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assessmentQueue = new Queue<AssessmentJobData, AssessmentJobResult>(
      QUEUE_NAMES.ASSESSMENT_GENERATION,
      {
        connection: getConnectionOpts() as never,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      }
    );
    assessmentQueue.on("error", (err: Error) =>
      console.error("[Queue] Error:", err.message)
    );
  }
  return assessmentQueue;
}

export function getConnectionConfig(): ReturnType<typeof getConnectionOpts> {
  return getConnectionOpts();
}

export async function closeQueues(): Promise<void> {
  if (assessmentQueue) {
    await assessmentQueue.close();
    assessmentQueue = null;
  }
}
