"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import Link from "next/link";
import { FileSpreadsheet, Users } from "lucide-react";

export default function DashboardPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  const { isAdmin } = useAdminAuth();

  const adminCards = [
    {
      title: "Import Users",
      description: "Upload Excel files to import student accounts",
      icon: <FileSpreadsheet className="h-8 w-8 text-blue-500" />,
      href: "/dashboard/admin/import-users",
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Manage Users",
      description: "View, edit, and manage student accounts",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      href: "/dashboard/admin/manage-users",
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Dashboard
        </h1>

        {isAdmin && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Admin Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {adminCards.map((card) => (
                <Link key={card.title} href={card.href}>
                  <div
                    className={`${card.color} p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer h-full`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {card.title}
                      </h2>
                      {card.icon}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {card.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Overview
        </h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to the VKU Coin dashboard. This is where you can manage your
            account and activities.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
