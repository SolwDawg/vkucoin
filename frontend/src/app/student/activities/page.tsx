"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { StudentActivities } from "@/components/student/StudentActivities";

export default function StudentActivitiesPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Hoạt động sinh viên</h1>
        <StudentActivities />
      </div>
    </DashboardLayout>
  );
}
