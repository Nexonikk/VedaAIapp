"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { AssignmentsList } from "@/components/assignments/assignments-list";

export default function AssignmentsPage() {
  return (
    <AppLayout mobileTitle="Assignments" showMobileSearch>
      <AssignmentsList />
    </AppLayout>
  );
}
