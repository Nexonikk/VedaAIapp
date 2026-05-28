"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QUESTION_TYPE_OPTIONS } from "@/config/constants";
import { useCreateAssignmentStore } from "@/store";
import type { QuestionTypeRow } from "@/types";

interface QuestionTypeRowProps {
  row: QuestionTypeRow;
}

export function QuestionTypeRowItem({ row }: QuestionTypeRowProps) {
  const { updateQuestionType, removeQuestionType } = useCreateAssignmentStore();

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2">
      {/* Type Select */}
      <Select
        value={row.type}
        onValueChange={(v) => updateQuestionType(row.id, { type: v as QuestionTypeRow["type"] })}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Questions */}
      <Input
        type="number"
        min={1}
        value={row.noOfQuestions}
        onChange={(e) =>
          updateQuestionType(row.id, {
            noOfQuestions: Math.max(1, parseInt(e.target.value) || 1),
          })
        }
        className="w-20 h-9 text-sm text-center"
      />

      {/* Marks */}
      <Input
        type="number"
        min={1}
        value={row.marks}
        onChange={(e) =>
          updateQuestionType(row.id, {
            marks: Math.max(1, parseInt(e.target.value) || 1),
          })
        }
        className="w-20 h-9 text-sm text-center"
      />

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50"
        onClick={() => removeQuestionType(row.id)}
        type="button"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
