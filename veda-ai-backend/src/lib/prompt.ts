interface PromptInput {
  title: string;
  questionTypes: Array<{
    type: string;
    noOfQuestions: number;
    marksPerQuestion: number;
  }>;
  additionalInfo?: string;
}

export function buildAssessmentPrompt(input: PromptInput): string {
  const { title, questionTypes, additionalInfo } = input;

  const totalQuestions = questionTypes.reduce((s, q) => s + q.noOfQuestions, 0);
  const totalMarks = questionTypes.reduce(
    (s, q) => s + q.noOfQuestions * q.marksPerQuestion,
    0
  );

  const sectionBreakdown = questionTypes
    .map(
      (q, i) =>
        `  Section ${String.fromCharCode(65 + i)} (${q.type}): ${q.noOfQuestions} questions × ${q.marksPerQuestion} marks each`
    )
    .join("\n");

  return `You are an expert educational assessment creator for Indian schools (CBSE/ICSE standard).

Generate a complete, structured question paper based on the following requirements:

ASSIGNMENT TITLE: ${title}
TOTAL QUESTIONS: ${totalQuestions}
TOTAL MARKS: ${totalMarks}

SECTION BREAKDOWN:
${sectionBreakdown}

${additionalInfo ? `ADDITIONAL INSTRUCTIONS: ${additionalInfo}` : ""}

REQUIREMENTS:
1. Infer the subject and class level from the assignment title and content
2. Create realistic, educationally appropriate questions
3. Distribute difficulties: roughly 30% easy, 50% moderate, 20% challenging
4. Each section should have a clear instruction line
5. Questions should be coherent and directly related to the subject
6. Answers should be detailed and accurate
7. timeAllowed should be calculated based on total marks (roughly 1 minute per mark)
8. paperTitle should reference the school name "Delhi Public School" and the subject

OUTPUT FORMAT (strict JSON):
- paperTitle: Full exam header (school name + subject)
- subject: The inferred subject name
- className: Appropriate class (e.g., "8th", "10th")
- timeAllowed: e.g., "45 minutes" or "3 hours"
- maximumMarks: ${totalMarks}
- sections: Array of sections matching the breakdown above
  - Each section has title (e.g., "Section A"), instruction, questionType, and questions array
  - Each question has text, difficulty ("easy"/"moderate"/"challenging"), marks, and answer

Generate high-quality, exam-ready questions now.`;
}
