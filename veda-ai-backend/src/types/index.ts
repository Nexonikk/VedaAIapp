// ── API Response wrapper ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── Assignment DTOs ───────────────────────────────────────────────────────────
export interface QuestionTypeRowDTO {
  type: string;
  noOfQuestions: number;
  marksPerQuestion: number;
}

export interface CreateAssignmentDTO {
  title: string;
  dueDate: string; // ISO date string
  questionTypes: QuestionTypeRowDTO[];
  additionalInfo?: string;
  filePath?: string;
}

// ── Serialized responses (matching frontend types exactly) ────────────────────
export interface AssignmentResponse {
  id: string;
  title: string;
  assignedOn: string; // ISO date
  dueDate: string;    // ISO date
  status: string;
  totalQuestions: number;
  totalMarks: number;
  output?: GeneratedOutputResponse | null;
}

export interface QuestionResponse {
  id: string;
  text: string;
  difficulty: "easy" | "moderate" | "challenging";
  marks: number;
}

export interface SectionResponse {
  id: string;
  title: string;
  instruction: string;
  questions: QuestionResponse[];
}

export interface AnswerKeyItemResponse {
  questionId: string;
  answer: string;
}

export interface GeneratedOutputResponse {
  assignmentId: string;
  paperTitle: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  sections: SectionResponse[];
  answerKey: AnswerKeyItemResponse[];
  generatedAt: string;
}

export interface CreateAssignmentResponse {
  assignmentId: string;
  jobId: string;
  message: string;
}

// ── AI generation types ───────────────────────────────────────────────────────
export interface AIQuestion {
  text: string;
  difficulty: "easy" | "moderate" | "challenging";
  marks: number;
  answer: string;
}

export interface AISection {
  title: string;       // "Section A"
  instruction: string; // "Attempt all questions..."
  questionType: string;
  questions: AIQuestion[];
}

export interface AIGeneratedPaper {
  paperTitle: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  sections: AISection[];
}

// ── WebSocket message types (mirroring frontend) ──────────────────────────────
export type WSMessageType =
  | "JOB_QUEUED"
  | "JOB_PROCESSING"
  | "JOB_COMPLETED"
  | "JOB_FAILED"
  | "PROGRESS_UPDATE";

export interface WSMessage {
  type: WSMessageType;
  jobId: string;
  payload?: unknown;
  progress?: number;
  message?: string;
}
