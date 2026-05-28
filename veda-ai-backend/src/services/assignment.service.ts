import { prisma } from "@/config/database";
import { AppError } from "@/middleware/error";
import { serializeAssignment, serializeOutput } from "@/lib/serializers";
import type { CreateAssignmentInput } from "@/lib/schemas";
import type { AssignmentResponse, GeneratedOutputResponse, AIGeneratedPaper } from "@/types";

const ASSIGNMENT_INCLUDE = {
  questionTypeConfig: true,
  output: {
    include: {
      sections: { include: { questions: true } },
      answerKey: true,
    },
  },
} as const;

function toDifficultyEnum(d: string): "EASY" | "MODERATE" | "CHALLENGING" {
  switch (d.toLowerCase()) {
    case "easy": return "EASY";
    case "challenging": return "CHALLENGING";
    default: return "MODERATE";
  }
}

export async function createAssignment(
  input: CreateAssignmentInput & { filePath?: string }
): Promise<{ id: string; totalQuestions: number; totalMarks: number }> {
  const totalQuestions = input.questionTypes.reduce((s, q) => s + q.noOfQuestions, 0);
  const totalMarks = input.questionTypes.reduce(
    (s, q) => s + q.noOfQuestions * q.marksPerQuestion, 0
  );

  const assignment = await prisma.assignment.create({
    data: {
      title: input.title,
      dueDate: new Date(input.dueDate),
      additionalInfo: input.additionalInfo,
      filePath: input.filePath,
      totalQuestions,
      totalMarks,
      questionTypeConfig: {
        create: input.questionTypes.map((q) => ({
          questionType: q.type,
          noOfQuestions: q.noOfQuestions,
          marksPerQuestion: q.marksPerQuestion,
        })),
      },
    },
  });

  return { id: assignment.id, totalQuestions, totalMarks };
}

export async function getAllAssignments(): Promise<AssignmentResponse[]> {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
    include: ASSIGNMENT_INCLUDE,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return assignments.map((a: Record<string,unknown>) => serializeAssignment(a as any));
}

export async function getAssignmentById(id: string): Promise<AssignmentResponse> {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: ASSIGNMENT_INCLUDE,
  });
  if (!assignment) throw new AppError("Assignment not found", 404);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return serializeAssignment(assignment as any);
}

export async function deleteAssignment(id: string): Promise<void> {
  const exists = await prisma.assignment.findUnique({ where: { id } });
  if (!exists) throw new AppError("Assignment not found", 404);
  await prisma.assignment.delete({ where: { id } });
}

export async function getAssignmentOutput(assignmentId: string): Promise<GeneratedOutputResponse> {
  const output = await prisma.generatedOutput.findUnique({
    where: { assignmentId },
    include: { sections: { include: { questions: true } }, answerKey: true },
  });
  if (!output) throw new AppError("Output not found for this assignment", 404);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return serializeOutput(output as any);
}

export async function saveGeneratedOutput(
  assignmentId: string,
  paper: AIGeneratedPaper
): Promise<GeneratedOutputResponse> {
  // Remove existing output for regenerate flow
  await prisma.generatedOutput.deleteMany({ where: { assignmentId } });

  const output = await prisma.generatedOutput.create({
    data: {
      assignmentId,
      paperTitle: paper.paperTitle,
      subject: paper.subject,
      className: paper.className,
      timeAllowed: paper.timeAllowed,
      maximumMarks: paper.maximumMarks,
      sections: {
        create: paper.sections.map((section, sIdx) => ({
          title: section.title,
          instruction: section.instruction,
          order: sIdx,
          questions: {
            create: section.questions.map((q, qIdx) => ({
              text: q.text,
              difficulty: toDifficultyEnum(q.difficulty),
              marks: q.marks,
              order: qIdx,
            })),
          },
        })),
      },
    },
    include: {
      sections: { include: { questions: true } },
      answerKey: true,
    },
  });

  // Save answer key — match flat question list to flat answers list
  type QRow = { id: string; order: number };
  type SRow = { order: number; questions: QRow[] };
  const allQuestions = (output.sections as SRow[])
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => (s.questions as QRow[]).sort((a, b) => a.order - b.order));

  const allAnswers = paper.sections.flatMap((s) => s.questions.map((q) => q.answer));

  if (allAnswers.length === allQuestions.length) {
    await prisma.answerKeyItem.createMany({
      data: allQuestions.map((q: {id:string}, i: number) => ({
        outputId: output.id,
        questionId: q.id,
        answer: allAnswers[i],
      })),
    });
  }

  // Re-fetch with answer key included
  const finalOutput = await prisma.generatedOutput.findUnique({
    where: { id: output.id },
    include: { sections: { include: { questions: true } }, answerKey: true },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return serializeOutput(finalOutput as any);
}

export async function updateAssignmentStatus(
  id: string,
  status: "ACTIVE" | "COMPLETED" | "DRAFT"
): Promise<void> {
  await prisma.assignment.update({ where: { id }, data: { status } });
}
