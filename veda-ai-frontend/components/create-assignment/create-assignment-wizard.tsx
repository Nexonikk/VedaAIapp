"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssignmentDetailsForm } from "./assignment-details-form";
import { GenerationProgress } from "./generation-progress";
import { useCreateAssignmentStore, useAssignmentStore } from "@/store";
import { assignmentService } from "@/services/assignment.service";
import { wsService } from "@/services/websocket.service";
import type { Assignment } from "@/types";
import { toast } from "react-toastify";

export function CreateAssignmentWizard() {
  const router = useRouter();
  const {
    step,
    formData,
    isSubmitting,
    wsStatus,
    assignmentId,
    jobId,
    generatedOutput,
    setStep,
    setSubmitting,
    setJobDetails,
    handleWSMessage,
    reset,
    updateFormData,
  } = useCreateAssignmentStore();
  const { addAssignment } = useAssignmentStore();

  useEffect(() => {
    if (!jobId || !assignmentId) return;
    wsService.connect(jobId);
    const unsub = wsService.subscribe(handleWSMessage);
    
    const pollInterval = setInterval(async () => {
      try {
        const res = await assignmentService.getJobStatus(assignmentId);
        if (res.success && res.data) {
          if (res.data.status === 'COMPLETED') {
            const outputRes = await assignmentService.getOutput(assignmentId);
            if (outputRes.success && outputRes.data) {
              handleWSMessage({ type: "JOB_COMPLETED", jobId, payload: outputRes.data, progress: 100, message: "Assignment generated successfully!" });
              clearInterval(pollInterval);
            }
          } else if (res.data.status === 'FAILED') {
            handleWSMessage({ type: "JOB_FAILED", jobId, message: res.data.errorMessage || "Generation failed" });
            clearInterval(pollInterval);
          }
        }
      } catch (e) {
        // Ignore fetch errors during polling
      }
    }, 2000);

    return () => {
      unsub();
      clearInterval(pollInterval);
    };
  }, [jobId, assignmentId, handleWSMessage]);

  useEffect(() => {
    if (wsStatus === "completed" && generatedOutput) {
      const newAssignment: Assignment = {
        id: generatedOutput.assignmentId,
        title: formData.title || "Quiz on Electricity",
        assignedOn: new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate,
        status: "active",
        totalQuestions: formData.questionTypes.reduce(
          (s, q) => s + q.noOfQuestions,
          0
        ),
        totalMarks: formData.questionTypes.reduce(
          (s, q) => s + q.noOfQuestions * q.marks,
          0
        ),
        output: generatedOutput,
      };
      addAssignment(newAssignment);
      setTimeout(() => {
        router.push(`/output/${generatedOutput.assignmentId}`);
        reset();
      }, 1000);
    }
  }, [
    wsStatus,
    generatedOutput,
    addAssignment,
    formData.title,
    formData.dueDate,
    formData.questionTypes,
    router,
    reset,
  ]);

  const handleNext = async () => {
    if (step === 1) {
      if (formData.questionTypes.length === 0 || formData.title === "" || formData.dueDate === "") {
     toast.error("Please fill all the required fields!", {
      style: {
      background: "#f88e48ff",
      color: "#fff",
      borderRadius: "10px",
      },
      });
        return;
      }

      setSubmitting(true);
      setStep(2);

      try {
        const fd = new FormData();
        fd.append("title", formData.title || "Quiz on Electricity");
        fd.append("dueDate", formData.dueDate);
        
        const mappedQuestionTypes = formData.questionTypes.map((q) => ({
          type: q.type,
          noOfQuestions: q.noOfQuestions,
          marksPerQuestion: q.marks,
        }));
        
        fd.append("questionTypes", JSON.stringify(mappedQuestionTypes));
        fd.append("additionalInfo", formData.additionalInfo || "");
        if (formData.file) fd.append("file", formData.file);

        const res = await assignmentService.create(fd);

        if (res?.success && res.data) {
          setJobDetails(res.data.assignmentId, res.data.jobId);
        } else {
          alert(res?.error || "Failed to create assignment");
          setStep(1);
        }
      } catch {
        alert("An unexpected error occurred");
        setStep(1);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => {
          if (step === 1) router.back();
          else { reset(); setStep(1); }
        }}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create Assignment</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Set up a new assignment for your students
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {step === 1 && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Assignment Title
              </label>
              <input
                value={formData.title}
                required
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="e.g. Quiz on Electricity"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <AssignmentDetailsForm />
          </>
        )}
        {step === 2 && <GenerationProgress />}
      </div>

      {step === 1 && (
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Previous
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
