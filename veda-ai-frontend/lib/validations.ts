import { z } from "zod";

export const questionTypeRowSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Question type is required"),
  noOfQuestions: z
    .number()
    .int()
    .positive("Must be greater than 0"),
  marks: z
    .number()
    .int()
    .positive("Must be greater than 0"),
});

export const assignmentFormSchema = z.object({
  title: z.string().min(1, "Assignment title is required"),
  file: z.instanceof(File).optional().nullable(),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypes: z
    .array(questionTypeRowSchema)
    .min(1, "At least one question type is required"),
  additionalInfo: z.string().optional(),
});

export type AssignmentFormSchema = z.infer<typeof assignmentFormSchema>;
