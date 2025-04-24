"use client";

import { useState } from "react";
import { Student } from "@/types/admin";
import {
  Edit,
  Trash2,
  User,
  Mail,
  CalendarDays,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteStudentDialog } from "./DeleteStudentDialog";

interface StudentListItemProps {
  student: Student;
  onDeleteSuccess: () => void;
}

export const StudentListItem = ({
  student,
  onDeleteSuccess,
}: StudentListItemProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Format date for display
  const formattedDate = new Date(student.dateOfBirth).toLocaleDateString();

  const handleEdit = () => {
    router.push(`/dashboard/admin/students/edit/${student.studentCode}`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    onDeleteSuccess();
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium flex items-center text-gray-900">
              <User className="h-4 w-4 mr-2 text-blue-600" />
              {student.fullName}
            </h3>
            <div className="mt-3 space-y-2">
              <p className="text-sm flex items-center text-gray-600">
                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                ID: {student.studentCode}
              </p>
              <p className="text-sm flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                {student.email}
              </p>
              <p className="text-sm flex items-center text-gray-600">
                <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                {formattedDate}
              </p>
              {student.class && (
                <p className="text-sm flex items-center text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                  Class: {student.class}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 rounded-full hover:bg-blue-50 transition-colors"
              title="Edit student"
            >
              <Edit className="h-5 w-5 text-blue-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Delete student"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteStudentDialog
          student={student}
          onDelete={handleDeleteSuccess}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
};
