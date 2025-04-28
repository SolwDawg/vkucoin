"use client";

import { useState, useEffect } from "react";
import { Student } from "@/types/admin";
import { adminService } from "@/services/admin.service";
import { StudentListItem } from "./StudentListItem";
import { Search, AlertCircle, RefreshCw, Users } from "lucide-react";

export const StudentList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [className, setClassName] = useState<string>("");
  const [classInput, setClassInput] = useState<string>("");
  const [totalStudents, setTotalStudents] = useState<number>(0);

  const fetchStudents = async (targetClass: string) => {
    if (!targetClass.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await adminService.getStudentsByClass(targetClass);
      setStudents(result.students);
      setClassName(result.className);
      setTotalStudents(result.totalStudents);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching students"
      );
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(classInput);
  };

  const handleRefresh = () => {
    if (className) {
      fetchStudents(className);
    }
  };

  const handleDeleteSuccess = () => {
    // Refresh the list after successful deletion
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Enter class name"
            value={classInput}
            onChange={(e) => setClassInput(e.target.value)}
            className="pl-10 py-2 px-4 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>

      {/* Results Section */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading students...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      ) : students.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Class: {className}
              </h2>
              <p className="text-sm text-gray-500">
                Total students: {totalStudents}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <StudentListItem
                key={student.studentCode}
                student={student}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}
          </div>
        </div>
      ) : className ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No students found in class {className}
          </p>
        </div>
      ) : null}
    </div>
  );
};
