"use client";

import { useState } from "react";
import { Student } from "@/types/admin";
import { adminService } from "@/services/admin.service";
import { Trash2, AlertTriangle, X, Check, Loader2 } from "lucide-react";

interface DeleteStudentDialogProps {
  student: Student;
  onDelete: () => void;
  onCancel: () => void;
}

export const DeleteStudentDialog = ({
  student,
  onDelete,
  onCancel,
}: DeleteStudentDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await adminService.deleteStudent(student.studentCode);
      onDelete();
    } catch (err: any) {
      const errorMessage = err.data?.message
        ? err.data.message
        : err instanceof Error
          ? err.message
          : "An error occurred while deleting the student";

      setError(errorMessage);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Confirm Deletion
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
            disabled={isDeleting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this student? This action cannot be
            undone.
          </p>

          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-xs text-gray-500">Student ID:</span>
                <p className="text-sm font-medium">{student.studentCode}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Name:</span>
                <p className="text-sm font-medium">{student.fullName}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Email:</span>
                <p className="text-sm font-medium">{student.email}</p>
              </div>
              {student.class && (
                <div>
                  <span className="text-xs text-gray-500">Class:</span>
                  <p className="text-sm font-medium">{student.class}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
