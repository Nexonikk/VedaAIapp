"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssignmentCard } from "./assignment-card";
import { EmptyAssignments } from "./empty-state";
import { useAssignmentStore } from "@/store";
import { assignmentService } from "@/services/assignment.service";

export function AssignmentsList() {
  const assignments = useAssignmentStore((s) => s.assignments);
  const setAssignments = useAssignmentStore((s) => s.setAssignments);
  const [search, setSearch] = useState("");

  useEffect(() => {
    assignmentService.getAll().then((res) => {
      if (res.success && res.data) {
        setAssignments(res.data);
      }
    });
  }, [setAssignments]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and create assignments for your classes.
          </p>
        </div>
        <Link href="/create-assignment" className="hidden lg:block">
          <Button variant="primary">
            <Plus size={16} />
            Create Assignment
          </Button>
        </Link>
      </div>

      {assignments.length === 0 ? (
        <EmptyAssignments />
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <SlidersHorizontal size={14} />
              Filter By
            </Button>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No assignments match your search
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Mobile FAB */}
      <Link href="/create-assignment" className="lg:hidden">
        <button className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-gray-900 text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
          <Plus size={24} />
        </button>
      </Link>
    </div>
  );
}
