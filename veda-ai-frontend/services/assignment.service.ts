import { APP_CONFIG } from "@/config/constants";
import type {
  ApiResponse,
  Assignment,
  CreateAssignmentResponse,
  GeneratedOutput,
} from "@/types";

const BASE = APP_CONFIG.apiBaseUrl;

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { success: false, error: err.message || "Request failed" };
    }
    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export const assignmentService = {
  getAll: () => request<Assignment[]>("/assignments"),

  getById: (id: string) => request<Assignment>(`/assignments/${id}`),

  create: (formData: FormData) =>
    fetch(`${BASE}/assignments`, {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json() as Promise<ApiResponse<CreateAssignmentResponse>>)
      .catch(
        (e): ApiResponse<CreateAssignmentResponse> => ({
          success: false,
          error: e.message,
        })
      ),

  delete: (id: string) =>
    request<void>(`/assignments/${id}`, { method: "DELETE" }),

  getOutput: (id: string) =>
    request<GeneratedOutput>(`/assignments/${id}/output`),

  regenerate: (id: string) =>
    request<CreateAssignmentResponse>(`/assignments/${id}/regenerate`, {
      method: "POST",
    }),

  getJobStatus: (id: string) =>
    request<{ status: string; errorMessage?: string }>(`/assignments/${id}/job`),
};
