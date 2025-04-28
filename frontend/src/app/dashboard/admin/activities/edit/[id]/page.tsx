"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { use } from "react";

interface EditActivityPageProps {
  params: {
    id: string;
  };
}

export default function EditActivityPage({ params }: EditActivityPageProps) {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  useAdminAuth();

  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Edit Activity
        </h1>

        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            Update the details of this activity.
          </p>
        </div>

        <ActivityForm mode="edit" activityId={id} />
      </div>
    </AdminLayout>
  );
}
