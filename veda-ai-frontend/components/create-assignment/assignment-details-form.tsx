"use client";

import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FileUploadZone } from "./file-upload-zone";
import { QuestionTypeRowItem } from "./question-type-row";
import { useCreateAssignmentStore } from "@/store";
import type { QuestionTypeRow } from "@/types";

export function AssignmentDetailsForm() {
  const {
    formData,
    updateFormData,
    addQuestionType,
  } = useCreateAssignmentStore();

  const handleAddQuestionType = () => {
    const newRow: QuestionTypeRow = {
      id: crypto.randomUUID(),
      type: "Multiple Choice Questions",
      noOfQuestions: 4,
      marks: 4,
    };
    addQuestionType(newRow);
  };

  const totalQuestions = formData.questionTypes.reduce(
    (sum, r) => sum + r.noOfQuestions,
    0
  );
  const totalMarks = formData.questionTypes.reduce(
    (sum, r) => sum + r.noOfQuestions * r.marks,
    0
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-base font-semibold text-gray-900">Assignment Details</h2>
        <p className="text-xs text-gray-500 mt-0.5">Basic information about your assignment</p>
      </div>

      {/* File Upload */}
      <div>
        <FileUploadZone
          value={formData.file}
          onChange={(file) => updateFormData({ file })}
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Upload images of your preferred document/image
        </p>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Due Date
        </label>
        <Input
          type="date"
          value={formData.dueDate}
          onChange={(e) => updateFormData({ dueDate: e.target.value })}
          className="max-w-xs"
        />
      </div>

      {/* Question Types Table */}
      <div>
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 pb-2 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Question Type
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20 text-center">
            No. of Q&apos;s
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20 text-center">
            Marks
          </span>
          <span className="w-9" />
        </div>

        <div className="divide-y divide-gray-50">
          {formData.questionTypes.map((row) => (
            <QuestionTypeRowItem key={row.id} row={row} />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddQuestionType}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mt-3 transition-colors"
        >
          <Plus size={15} className="text-gray-400" />
          Add Question Type
        </button>
      </div>

      {/* Totals */}
      {formData.questionTypes.length > 0 && (
        <div className="flex gap-6 p-3 bg-gray-50 rounded-lg text-sm">
          <span className="text-gray-600">
            Total Questions :{" "}
            <span className="font-semibold text-gray-900">{totalQuestions}</span>
          </span>
          <span className="text-gray-600">
            Total Marks :{" "}
            <span className="font-semibold text-gray-900">{totalMarks}</span>
          </span>
        </div>
      )}

      {/* Additional Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Additional Information{" "}
          <span className="text-gray-400 font-normal">(For better output)</span>
        </label>
        <textarea
          value={formData.additionalInfo}
          onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
          placeholder="e.g Generate a question paper for 3 hour exam duration..."
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all"
        />
      </div>
    </div>
  );
}
