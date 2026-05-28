"use client";

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignmentStore } from "@/store";
import type { Assignment } from "@/types";
import { format } from "date-fns";
import { assignmentService } from "@/services/assignment.service";

interface AssignmentCardProps {
  assignment: Assignment;
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "dd-MM-yyyy");
  } catch {
    return dateStr;
  }
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const deleteAssignment = async () =>{
    const response = await assignmentService.delete(assignment.id);
    if (response.success) {
      useAssignmentStore.setState((state) => ({
        assignments: state.assignments.filter((a) => a.id !== assignment.id),
      }));
    }
  };


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
            {assignment.title}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>Assigned on : {formatDate(assignment.assignedOn)}</span>
            <span>Due : {formatDate(assignment.dueDate)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/output/${assignment.id}`}>
            <Button variant="outline" size="sm" className="text-xs h-8 px-3">
              <Eye size={13} />
              View Assignment
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600"
            onClick={deleteAssignment}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
