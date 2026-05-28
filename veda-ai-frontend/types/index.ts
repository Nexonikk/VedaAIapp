// Assignment types
export type QuestionType =
  | "Multiple Choice Questions"
  | "Short Questions"
  | "Diagram/Graph-Based Questions"
  | "Numerical Problems"
  | "Long Answer Questions"
  | "True/False";

export type Difficulty = "easy" | "moderate" | "challenging";

export interface QuestionTypeRow {
  id: string;
  type: QuestionType;
  noOfQuestions: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  file: File | null;
  dueDate: string;
  questionTypes: QuestionTypeRow[];
  additionalInfo: string;
}

export interface Assignment {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  status: "active" | "draft" | "completed";
  totalQuestions: number;
  totalMarks: number;
  output?: GeneratedOutput | null;
}

// Output / Generated Paper types
export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedOutput {
  assignmentId: string;
  paperTitle: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  sections: Section[];
  answerKey: AnswerKeyItem[];
  generatedAt: string;
}

export interface AnswerKeyItem {
  questionId: string;
  answer: string;
}

// WebSocket message types
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateAssignmentResponse {
  assignmentId: string;
  jobId: string;
  message: string;
}
