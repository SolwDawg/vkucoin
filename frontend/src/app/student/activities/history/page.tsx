"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import ParticipationHistory from "@/components/student/ParticipationHistory";
import { useAuth } from "@/hooks/useAuth";

export default function ParticipationHistoryPage() {
  // Ensure the user is authenticated
  useAuth({ requireAuth: true });

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Lịch sử tham gia hoạt động</h1>
        <ParticipationHistory />
      </div>
    </DashboardLayout>
  );
} 