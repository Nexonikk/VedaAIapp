"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { AssignmentsList } from "@/components/assignments/assignments-list";

export default function HomePage() {
  return (
    <AppLayout mobileTitle="VedaAI" showMobileSearch>
      <AssignmentsList />
    </AppLayout>
  );
}
