"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { CreateAssignmentWizard } from "@/components/create-assignment/create-assignment-wizard";

export default function CreateAssignmentPage() {
  return (
    <AppLayout mobileTitle="Create Assignment">
      <CreateAssignmentWizard />
    </AppLayout>
  );
}
