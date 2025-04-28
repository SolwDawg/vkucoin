"use client";

import { useState, useRef } from "react";
import { adminService } from "@/services/admin.service";
import { ImportUsersResponse, UserImportResult } from "@/types/admin";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

export const ImportUsersForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImportUsersResponse | null>(null);
  console.log(results);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setResults(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
      setResults(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (![".xlsx", ".xls"].some((ext) => file.name.endsWith(ext))) {
      setError("Only Excel files (.xlsx, .xls) are allowed");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.importUsers(file);
      setResults(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during import"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Count success and errors in import results
  const getResultStats = () => {
    if (!results?.results) return { success: 0, error: 0, total: 0 };

    const success = results.results.filter(
      (r) => r.message === "Thành công"
    ).length;
    return {
      success,
      error: results.results.length - success,
      total: results.results.length,
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Import Users
        </h2>

        {!results ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 p-4 rounded-lg text-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-8 px-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="hidden"
                id="file-upload"
              />

              <div className="space-y-2">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {file ? file.name : "Drop Excel file here or click to upload"}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Excel files only (.xlsx, .xls)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={isLoading || !file}
                className={`py-2.5 px-6 rounded-lg text-white font-medium flex items-center justify-center transition-colors ${
                  isLoading || !file
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
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
                    Importing...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Import Users
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                <p>{results.message}</p>
              </div>
              <div className="text-sm">
                {getResultStats().success}/{getResultStats().total} successful
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Password
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {results.results.map((result, index) => (
                      <tr
                        key={index}
                        className={
                          result.message === "Thành công"
                            ? ""
                            : "bg-red-50 dark:bg-red-900/10"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {result.studentCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {result.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {result.email || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {result.password ? "••••••••" : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {result.message === "Thành công" ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                                <span className="text-sm text-green-600 dark:text-green-400">
                                  Success
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                                <span className="text-sm text-red-600 dark:text-red-400">
                                  {result.message}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetForm}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center justify-center transition-colors"
              >
                Import More Users
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
