import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  Assignment,
  AssignmentFormData,
  GeneratedOutput,
  QuestionTypeRow,
  WSMessage,
} from "@/types";

interface AssignmentState {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  setSelectedAssignment: (assignment: Assignment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAssignmentStore = create<AssignmentState>()(
  devtools(
    persist(
      (set) => ({
        assignments: [],
        selectedAssignment: null,
        isLoading: false,
        error: null,

        setAssignments: (assignments) => set({ assignments }),
        addAssignment: (assignment) =>
          set((state) => ({
            assignments: [assignment, ...state.assignments],
          })),
        updateAssignment: (id, updates) =>
          set((state) => ({
            assignments: state.assignments.map((a) =>
              a.id === id ? { ...a, ...updates } : a
            ),
          })),
        deleteAssignment: (id) =>
          set((state) => ({
            assignments: state.assignments.filter((a) => a.id !== id),
          })),
        setSelectedAssignment: (assignment) =>
          set({ selectedAssignment: assignment }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
      }),
      { name: "veda-assignments" }
    )
  )
);

interface CreateAssignmentState {
  step: number;
  formData: AssignmentFormData;
  isSubmitting: boolean;
  assignmentId: string | null;
  jobId: string | null;
  generatedOutput: GeneratedOutput | null;
  wsProgress: number;
  wsMessage: string;
  wsStatus: "idle" | "queued" | "processing" | "completed" | "failed";

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (updates: Partial<AssignmentFormData>) => void;
  addQuestionType: (row: QuestionTypeRow) => void;
  updateQuestionType: (id: string, updates: Partial<QuestionTypeRow>) => void;
  removeQuestionType: (id: string) => void;
  setSubmitting: (submitting: boolean) => void;
  setJobDetails: (assignmentId: string | null, jobId: string | null) => void;
  setGeneratedOutput: (output: GeneratedOutput | null) => void;
  handleWSMessage: (msg: WSMessage) => void;
  reset: () => void;
}

const defaultFormData: AssignmentFormData = {
  title: "",
  file: null,
  dueDate: "",
  questionTypes: [],
  additionalInfo: "",
};

export const useCreateAssignmentStore = create<CreateAssignmentState>()(
  devtools((set) => ({
    step: 1,
    formData: defaultFormData,
    isSubmitting: false,
    assignmentId: null,
    jobId: null,
    generatedOutput: null,
    wsProgress: 0,
    wsMessage: "",
    wsStatus: "idle",

    setStep: (step) => set({ step }),
    nextStep: () => set((state) => ({ step: state.step + 1 })),
    prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

    updateFormData: (updates) =>
      set((state) => ({ formData: { ...state.formData, ...updates } })),

    addQuestionType: (row) =>
      set((state) => ({
        formData: {
          ...state.formData,
          questionTypes: [...state.formData.questionTypes, row],
        },
      })),

    updateQuestionType: (id, updates) =>
      set((state) => ({
        formData: {
          ...state.formData,
          questionTypes: state.formData.questionTypes.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        },
      })),

    removeQuestionType: (id) =>
      set((state) => ({
        formData: {
          ...state.formData,
          questionTypes: state.formData.questionTypes.filter((q) => q.id !== id),
        },
      })),

    setSubmitting: (isSubmitting) => set({ isSubmitting }),
    setJobDetails: (assignmentId, jobId) => set({ assignmentId, jobId }),
    setGeneratedOutput: (generatedOutput) => set({ generatedOutput }),

    handleWSMessage: (msg) => {
      switch (msg.type) {
        case "JOB_QUEUED":
          set({ wsStatus: "queued", wsProgress: 5, wsMessage: msg.message || "Job queued..." });
          break;
        case "JOB_PROCESSING":
          set({
            wsStatus: "processing",
            wsProgress: msg.progress || 50,
            wsMessage: msg.message || "Generating questions...",
          });
          break;
        case "PROGRESS_UPDATE":
          set({ wsProgress: msg.progress || 0, wsMessage: msg.message || "" });
          break;
        case "JOB_COMPLETED":
          set({
            wsStatus: "completed",
            wsProgress: 100,
            wsMessage: "Assignment generated!",
            generatedOutput: msg.payload as GeneratedOutput,
          });
          break;
        case "JOB_FAILED":
          set({
            wsStatus: "failed",
            wsMessage: msg.message || "Generation failed",
          });
          break;
      }
    },

    reset: () =>
      set({
        step: 1,
        formData: defaultFormData,
        isSubmitting: false,
        assignmentId: null,
        jobId: null,
        generatedOutput: null,
        wsProgress: 0,
        wsMessage: "",
        wsStatus: "idle",
      }),
  }))
);

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    sidebarOpen: true,
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  }))
);
