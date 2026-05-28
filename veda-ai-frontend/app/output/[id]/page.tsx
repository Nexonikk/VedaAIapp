"use client";

import { use, useEffect, useState } from "react";
import { useAssignmentStore } from "@/store";
import { AppLayout } from "@/components/layout/app-layout";
import { OutputPage } from "@/components/output/output-page";
import { assignmentService } from "@/services/assignment.service";
import Link from "next/link";
import { GeneratedOutput } from "@/types";
import { Loader2 } from "lucide-react";

export default function OutputIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const assignments = useAssignmentStore((s) => s.assignments);
  const assignment = assignments.find((a) => a.id === id);
  const [output, setOutput] = useState<GeneratedOutput | null>(assignment?.output ?? null);
  const [isLoading, setIsLoading] = useState(!output);

  useEffect(() => {
    if (!output) {
      assignmentService.getOutput(id).then((res) => {
        if (res.success && res.data) {
          setOutput(res.data);
        }
        setIsLoading(false);
      });
    }
  }, [id, output]);

  return (
    <AppLayout mobileTitle="Assignment Output">
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : output ? (
        <OutputPage output={output} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <p className="text-gray-500 mb-4">Output not found for this assignment.</p>
          <Link href="/assignments" className="text-sm text-gray-900 underline">
            Back to Assignments
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
