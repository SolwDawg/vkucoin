"use client";

import { useState } from "react";
import { adminService } from "@/services/admin.service";
import { Activity } from "@/types/admin";
import { Trash, X, AlertTriangle } from "lucide-react";

interface DeleteActivityDialogProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteActivityDialog = ({
  activity,
  isOpen,
  onClose,
  onSuccess,
}: DeleteActivityDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!activity.id) {
      setError("Activity ID is missing");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await adminService.deleteActivity(activity.id);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while deleting the activity"
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center text-red-600 dark:text-red-400">
            <Trash className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-medium">Delete Activity</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 p-3 rounded-md text-sm flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Are you sure you want to delete this activity?
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="font-medium text-gray-800 dark:text-white">
                {activity.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {activity.description}
              </p>
            </div>
          </div>

          <div className="flex justify-between space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2 px-4 border border-transparent rounded-md text-white font-medium bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex justify-center items-center"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Deleting...
                </>
              ) : (
                "Delete Activity"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
