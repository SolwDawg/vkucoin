"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function AddActivityPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  useAdminAuth();

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Add Activity
        </h1>

        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            Create a new activity for students to participate in and earn coins.
          </p>
        </div>

        <ActivityForm mode="create" />
      </div>
    </AdminLayout>
  );
}
