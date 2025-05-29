"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import StudentProfile from "@/components/student/StudentProfile";
import { useAuth } from "@/hooks/useAuth";

export default function StudentProfilePage() {
  // Ensure the user is authenticated
  useAuth({ requireAuth: true });

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Hồ sơ của tôi</h1>
        <StudentProfile />
      </div>
    </DashboardLayout>
  );
}
