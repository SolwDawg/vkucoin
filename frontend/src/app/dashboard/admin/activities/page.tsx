"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { ActivityList } from "@/components/admin/ActivityList";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function ActivitiesPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  useAdminAuth();

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Activities
          </h1>

          <Link
            href="/dashboard/admin/activities/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Activity
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all activities available for students.
          </p>
        </div>

        <ActivityList />
      </div>
    </AdminLayout>
  );
}
