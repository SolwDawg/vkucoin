"use client";

import { Suspense } from "react";
import StudentActivities from "@/components/student/StudentActivities";

export default function ActivitiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Activities</h1>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <StudentActivities />
      </Suspense>
    </div>
  );
}
