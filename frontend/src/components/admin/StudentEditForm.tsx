"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import {
  Student,
  UpdateStudentDto,
  UpdateStudentResponse,
} from "@/types/admin";
import {
  User,
  Save,
  AlertCircle,
  CheckCircle,
  School,
  Mail,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentEditFormProps {
  studentCode: string;
}

export const StudentEditForm = ({ studentCode }: StudentEditFormProps) => {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<UpdateStudentDto>({
    fullName: "",
    class: "",
    dateOfBirth: "",
    newEmail: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const data = await adminService.getStudentByCode(studentCode);
        setStudent(data);

        // Format dates for datetime-local input (yyyy-MM-dd)
        const formattedDateOfBirth = new Date(data.dateOfBirth)
          .toISOString()
          .split("T")[0];

        // Initialize form data with current values
        setFormData({
          fullName: data.fullName,
          class: data.class || "",
          dateOfBirth: formattedDateOfBirth,
          newEmail: "", // Empty by default, only used if changing email
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching student details"
        );
      } finally {
        setIsFetching(false);
      }
    };

    if (studentCode) {
      fetchStudent();
    }
  }, [studentCode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    if (formData.newEmail && !/^\S+@\S+\.\S+$/.test(formData.newEmail)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for submission
      const updateData: UpdateStudentDto = {};

      // Only include fields that have changed
      if (student?.fullName !== formData.fullName) {
        updateData.fullName = formData.fullName;
      }

      if (student?.class !== formData.class) {
        updateData.class = formData.class;
      }

      const formattedOriginalDate = new Date(student?.dateOfBirth || "")
        .toISOString()
        .split("T")[0];

      if (formattedOriginalDate !== formData.dateOfBirth) {
        updateData.dateOfBirth = formData.dateOfBirth;
      }

      if (formData.newEmail && formData.newEmail !== student?.email) {
        updateData.newEmail = formData.newEmail;
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0) {
        setSuccess("No changes to save");
        setIsLoading(false);
        return;
      }

      const response = await adminService.updateStudent(
        studentCode,
        updateData
      );
      setSuccess("Student updated successfully!");

      // Update the student state with new values
      if (student) {
        setStudent({
          ...student,
          fullName: response.updated.fullName,
          class: response.updated.class,
          email: response.updated.email,
          dateOfBirth: response.updated.dateOfBirth,
        });
      }

      // Navigate back to students list after a short delay
      setTimeout(() => {
        router.push("/dashboard/admin/students");
      }, 1500);
    } catch (err: any) {
      if (err.data?.message) {
        setError(err.data.message);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while updating the student"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading student data...</span>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          onClick={() => router.push("/dashboard/admin/students")}
          className="mt-3 px-4 py-2 bg-white border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
        >
          Go back to students list
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-blue-600 p-6 text-white">
        <h2 className="text-xl font-semibold flex items-center">
          <User className="mr-2" size={20} />
          Edit Student: {student?.fullName}
        </h2>
        <p className="text-blue-100">Student ID: {studentCode}</p>
      </div>

      {success && (
        <div className="bg-green-50 p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
              />
            </div>
          </div>

          {/* Class */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Class"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* New Email */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Email (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="newEmail"
                value={formData.newEmail}
                onChange={handleChange}
                className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="New Email (leave empty to keep current)"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Current email: {student?.email || "N/A"}
            </p>
          </div>

          {/* Additional Information - Read Only */}
          <div className="col-span-2 mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Additional Information (Read Only)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Wallet Address:</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {student?.walletAddress || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Wallet Balance:</p>
                <p className="text-sm font-medium text-blue-600">
                  {student?.walletBalance || 0} VKU
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-2 mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/students")}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
