"use client";

import { useAuth } from "@/hooks/useAuth";
import { StudentList } from "@/components/admin/StudentList";

export default function StudentsPage() {
  // Ensure user is authenticated and has admin role
  useAuth({ requireAuth: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Students</h1>
      <StudentList />
    </div>
  );
}
