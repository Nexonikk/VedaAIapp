"use client";

import { useRef } from "react";
import { Download, RefreshCw, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/config/constants";
import type { GeneratedOutput, Difficulty } from "@/types";

interface OutputPageProps {
  output: GeneratedOutput;
  onRegenerate?: () => void;
}

export function OutputPage({ output, onRegenerate }: OutputPageProps) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw size={14} />
              Regenerate
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handleDownloadPDF}>
            <Download size={14} />
            Download as PDF
          </Button>
        </div>
      </div>

      {/* Paper */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-none"
      >
        {/* Paper Header */}
        <div className="border-b border-gray-200 px-8 py-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">{output.paperTitle}</h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-gray-600">
            <span>Subject: {output.subject}</span>
            <span>Class: {output.className}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-gray-600">
            <span>Time Allowed: {output.timeAllowed}</span>
            <span>Maximum Marks: {output.maximumMarks}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            All questions are compulsory unless stated otherwise.
          </p>
        </div>

        {/* Student Info */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Name", lines: "________________________" },
              { label: "Roll Number", lines: "________________" },
              { label: "Class & Section", lines: "___________" },
            ].map(({ label, lines }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">{label}:</span>
                <span className="text-sm text-gray-300 font-mono">{lines}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="px-8 py-6 space-y-8">
          {output.sections.map((section, si) => (
            <div key={section.id}>
              {/* Section Header */}
              <div className="mb-4">
                <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{section.instruction}</p>
              </div>

              {/* Questions */}
              <ol className="space-y-4">
                {section.questions.map((q, qi) => (
                  <li key={q.id} className="flex gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6 shrink-0 pt-0.5">
                      {qi + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-800 leading-relaxed flex-1">
                          {q.text}
                        </p>
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <Badge
                            variant={q.difficulty as Difficulty}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                          >
                            {DIFFICULTY_LABELS[q.difficulty]}
                          </Badge>
                          <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                            [{q.marks} Marks]
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {si < output.sections.length - 1 && (
                <div className="mt-6 border-b border-dashed border-gray-200" />
              )}
            </div>
          ))}

          <div className="text-center text-sm text-gray-400 font-medium pt-4 border-t border-gray-100">
            — End of Question Paper —
          </div>
        </div>

        {/* Answer Key */}
        {output.answerKey.length > 0 && (
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Answer Key</h3>
            <div className="space-y-3">
              {output.answerKey.map((ak, i) => (
                <div key={ak.questionId} className="text-sm">
                  <span className="font-medium text-gray-700">{i + 1}. </span>
                  <span className="text-gray-600">{ak.answer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
