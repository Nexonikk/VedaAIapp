"use client";

import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useCreateAssignmentStore } from "@/store";

export function GenerationProgress() {
  const { wsProgress, wsMessage, wsStatus } = useCreateAssignmentStore();

  const statusConfig = {
    idle: { icon: Loader2, color: "text-gray-400", spin: true },
    queued: { icon: Loader2, color: "text-amber-500", spin: true },
    processing: { icon: Loader2, color: "text-blue-500", spin: true },
    completed: { icon: CheckCircle2, color: "text-emerald-500", spin: false },
    failed: { icon: XCircle, color: "text-red-500", spin: false },
  };

  const { icon: Icon, color, spin } = statusConfig[wsStatus];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`mb-6 ${color}`}>
        <Icon size={48} className={spin ? "animate-spin" : ""} />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {wsStatus === "completed"
          ? "Assignment Generated!"
          : wsStatus === "failed"
          ? "Generation Failed"
          : "Generating Your Assignment"}
      </h2>

      <p className="text-sm text-gray-500 max-w-xs mb-8">
        {wsMessage || "Please wait while AI generates your question paper..."}
      </p>

      {wsStatus !== "completed" && wsStatus !== "failed" && (
        <div className="w-full max-w-sm">
          <Progress value={wsProgress} className="h-2" />
          <p className="text-xs text-gray-400 mt-2 text-right">{wsProgress}%</p>
        </div>
      )}
    </div>
  );
}
