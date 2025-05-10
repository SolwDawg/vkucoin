"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { TransactionSummary } from "@/components/admin/transactions/TransactionSummary";
import { TransactionHistory } from "@/components/admin/transactions/TransactionHistory";
import { useState } from "react";

export default function TransactionsPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  useAdminAuth();

  const [activeTab, setActiveTab] = useState<"summary" | "history">("summary");

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Transaction Management
        </h1>

        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("summary")}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "summary"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Transaction Summary
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Transaction History
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "summary" ? (
          <TransactionSummary />
        ) : (
          <TransactionHistory />
        )}
      </div>
    </AdminLayout>
  );
}
