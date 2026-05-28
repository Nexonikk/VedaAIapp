export const APP_CONFIG = {
  name: "VedaAI",
  description: "AI Assessment Creator",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000",
} as const;

export const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "True/False",
] as const;

export const DIFFICULTY_COLORS = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-100 text-amber-700 border-amber-200",
  challenging: "bg-red-100 text-red-700 border-red-200",
} as const;

export const DIFFICULTY_LABELS = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
} as const;

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Assignments", href: "/assignments", icon: "FileText" },
  { label: "AI Toolkit", href: "/ai-toolkit", icon: "Sparkles" },
  { label: "Library", href: "/library", icon: "BookOpen" },
] as const;

export const SIDEBAR_ITEMS = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "My Groups", href: "/groups", icon: "Users" },
  { label: "Assignments", href: "/assignments", icon: "FileText", badge: true },
  { label: "AI Teachers Toolkit", href: "/ai-toolkit", icon: "Sparkles" },
  { label: "My Library", href: "/library", icon: "BookOpen" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;
