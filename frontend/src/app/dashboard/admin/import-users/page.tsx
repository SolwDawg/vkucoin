"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { ImportUsersForm } from "@/components/admin/ImportUsersForm";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function ImportUsersPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  useAdminAuth();

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Nhập người dùng
        </h1>

        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Tải lên file Excel (.xlsx, .xls) chứa thông tin sinh viên để
            nhập vào hệ thống.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            File nên chứa các cột sau: Mã sinh viên,
            Họ và tên, Lớp, Ngày sinh.
          </p>
        </div>

        <ImportUsersForm />
      </div>
    </AdminLayout>
  );
}
