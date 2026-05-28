"use client";

import Link from "next/link";
import { FileX2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyAssignments() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center">
          <FileX2 size={48} className="text-gray-300" />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-red-400 text-xs font-bold">×</span>
        </div>
        <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-blue-100 rounded-full border-2 border-white" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        No assignments yet
      </h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-8">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      <Link href="/create-assignment">
        <Button variant="primary" size="lg" className="rounded-xl px-8">
          Create Your First Assignment
        </Button>
      </Link>
    </div>
  );
}
