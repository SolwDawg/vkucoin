"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { Activity } from "@/types/admin";
import { Calendar, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { DeleteActivityDialog } from "./DeleteActivityDialog";
import { ActivityTable } from "./ActivityTable";

export const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getActivities();
      setActivities(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải danh sách hoạt động"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDeleteClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSuccessMessage(
      `Hoạt động "${selectedActivity?.name}" đã được xóa thành công`
    );
    fetchActivities(); // Refresh the list after deletion

    // Hide success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Đang tải hoạt động...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 p-6 rounded-lg flex items-start">
        <AlertCircle className="h-6 w-6 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-lg mb-1">Lỗi khi tải hoạt động</h3>
          <p>{error}</p>
          <button
            onClick={() => fetchActivities()}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Không tìm thấy hoạt động
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Hiện tại chưa có hoạt động nào.
        </p>
        <Link
          href="/dashboard/admin/activities/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Tạo hoạt động
        </Link>
      </div>
    );
  }

  return (
    <>
      {successMessage && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-200 p-4 rounded-lg text-sm flex items-start">
          <div className="flex-1">{successMessage}</div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-3 text-green-600 dark:text-green-200 hover:text-green-800 dark:hover:text-green-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <ActivityTable 
          activities={activities} 
          onDeleteClick={handleDeleteClick} 
        />
      </div>

      {selectedActivity && (
        <DeleteActivityDialog
          activity={selectedActivity}
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
};
