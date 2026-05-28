import { z } from "zod";

export const questionTypeRowSchema = z.object({
  type: z.enum([
    "Multiple Choice Questions",
    "Short Questions",
    "Diagram/Graph-Based Questions",
    "Numerical Problems",
    "Long Answer Questions",
    "True/False",
  ]),
  noOfQuestions: z.number().int().min(1).max(50),
  marksPerQuestion: z.number().int().min(1).max(20),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypes: z
    .array(questionTypeRowSchema)
    .min(1, "At least one question type is required")
    .max(10),
  additionalInfo: z.string().max(1000).optional().default(""),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const aiQuestionSchema = z.object({
  text: z.string().min(1),
  difficulty: z.enum(["easy", "moderate", "challenging"]),
  marks: z.number().int().min(1),
  answer: z.string().min(1),
});

export const aiSectionSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  questionType: z.string(),
  questions: z.array(aiQuestionSchema).min(1),
});

export const aiGeneratedPaperSchema = z.object({
  paperTitle: z.string(),
  subject: z.string(),
  className: z.string(),
  timeAllowed: z.string(),
  maximumMarks: z.number().int().min(1),
  sections: z.array(aiSectionSchema).min(1),
});

export type AIGeneratedPaper = z.infer<typeof aiGeneratedPaperSchema>;
