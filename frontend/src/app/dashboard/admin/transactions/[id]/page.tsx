"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { TransactionDetailsResponse } from "@/types/admin";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  User,
  Hash,
  CreditCard,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function TransactionDetailPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  useAdminAuth();

  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<TransactionDetailsResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransactionDetails() {
      try {
        const id = Number(params?.id);
        if (isNaN(id)) {
          setError("Invalid transaction ID");
          setLoading(false);
          return;
        }

        const response = await adminService.getTransactionById(id);
        setDetails(response);
      } catch (err: any) {
        setError(err.message || "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    }

    loadTransactionDetails();
  }, [params]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !details) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error || "Failed to load transaction details"}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:text-red-200 dark:bg-red-800/30 dark:hover:bg-red-800/50"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { transaction, blockchainDetails } = details;
  const blockchainData = blockchainDetails
    ? JSON.parse(blockchainDetails)
    : null;

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Details
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Transaction #{transaction.id}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {new Date(transaction.createdAt).toLocaleString()} (
              {formatDistanceToNow(new Date(transaction.createdAt), {
                addSuffix: true,
              })}
              )
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      User
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white">
                    {transaction.userName} ({transaction.studentCode})
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Amount
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {transaction.amount} VKU
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Type
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.transactionType)}`}
                    >
                      {transaction.transactionType}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white">
                    {transaction.description || "No description provided"}
                  </p>
                </div>
              </div>

              {transaction.transactionHash && (
                <div>
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Hash className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Transaction Hash
                      </span>
                    </div>
                    <div className="flex items-center">
                      <p className="text-gray-900 dark:text-white text-sm font-mono break-all">
                        {transaction.transactionHash}
                      </p>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${transaction.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {blockchainData && (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              blockchainData.Status === "Success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {blockchainData.Status}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Block Information
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Block Number: {blockchainData.BlockNumber}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Gas Used: {blockchainData.GasUsed}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "activityreward":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "transfer":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "deposit":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    case "withdrawal":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}
