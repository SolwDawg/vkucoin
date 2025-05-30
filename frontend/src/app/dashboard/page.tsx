"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import Link from "next/link";
import { FileSpreadsheet, Users, Calendar, ListTodo, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  const { isAdmin } = useAdminAuth();

  const adminCards = [
    {
      title: "Thống kê & Phân tích",
      description: "Xem báo cáo chi tiết về hoạt động và hiệu suất hệ thống",
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      href: "/dashboard/admin/analytics",
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Thêm người dùng",
      description: "Tải lên tệp Excel để nhập tài khoản sinh viên",
      icon: <FileSpreadsheet className="h-8 w-8 text-blue-500" />,
      href: "/dashboard/admin/import-users",
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Quản lý hoạt động",
      description: "Xem và quản lý tất cả hoạt động của sinh viên",
      icon: <ListTodo className="h-8 w-8 text-indigo-500" />,
      href: "/dashboard/admin/activities",
      color: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Thêm hoạt động",
      description: "Tạo hoạt động mới cho sinh viên tham gia",
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      href: "/dashboard/admin/activities/add",
      color: "bg-green-50 dark:bg-green-900/20",
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
      </div>
    </AdminLayout>
  );
}
