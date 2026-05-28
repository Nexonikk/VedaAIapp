import type {
  AssignmentResponse,
  GeneratedOutputResponse,
  SectionResponse,
  QuestionResponse,
} from "@/types";

interface RawQuestion {
  id: string;
  text: string;
  difficulty: string;
  marks: number;
  order: number;
}

interface RawSection {
  id: string;
  title: string;
  instruction: string;
  order: number;
  questions: RawQuestion[];
}

interface RawAnswerKey {
  questionId: string;
  answer: string;
}

interface RawOutput {
  id: string;
  assignmentId: string;
  paperTitle: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generatedAt: Date;
  sections: RawSection[];
  answerKey: RawAnswerKey[];
}

interface RawQuestionTypeConfig {
  questionType: string;
  noOfQuestions: number;
  marksPerQuestion: number;
}

interface RawAssignment {
  id: string;
  title: string;
  createdAt: Date;
  dueDate: Date;
  status: string;
  totalQuestions: number;
  totalMarks: number;
  questionTypeConfig: RawQuestionTypeConfig[];
  output: RawOutput | null;
}

function mapDifficulty(d: string): "easy" | "moderate" | "challenging" {
  switch (d.toUpperCase()) {
    case "EASY": return "easy";
    case "CHALLENGING": return "challenging";
    default: return "moderate";
  }
}

export function serializeQuestion(q: RawQuestion): QuestionResponse {
  return { id: q.id, text: q.text, difficulty: mapDifficulty(q.difficulty), marks: q.marks };
}

export function serializeSection(s: RawSection): SectionResponse {
  return {
    id: s.id,
    title: s.title,
    instruction: s.instruction,
    questions: [...s.questions].sort((a, b) => a.order - b.order).map(serializeQuestion),
  };
}

export function serializeOutput(o: RawOutput): GeneratedOutputResponse {
  return {
    assignmentId: o.assignmentId,
    paperTitle: o.paperTitle,
    subject: o.subject,
    className: o.className,
    timeAllowed: o.timeAllowed,
    maximumMarks: o.maximumMarks,
    generatedAt: o.generatedAt.toISOString(),
    sections: [...o.sections].sort((a, b) => a.order - b.order).map(serializeSection),
    answerKey: o.answerKey.map((ak) => ({ questionId: ak.questionId, answer: ak.answer })),
  };
}

export function serializeAssignment(a: RawAssignment): AssignmentResponse {
  return {
    id: a.id,
    title: a.title,
    assignedOn: a.createdAt.toISOString().split("T")[0],
    dueDate: a.dueDate.toISOString().split("T")[0],
    status: a.status.toLowerCase() as AssignmentResponse["status"],
    totalQuestions: a.totalQuestions,
    totalMarks: a.totalMarks,
    output: a.output ? serializeOutput(a.output) : null,
  };
}
