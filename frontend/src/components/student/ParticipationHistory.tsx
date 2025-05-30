"use client";

import React, { useState, useEffect } from "react";
import { studentService } from "@/services/student.service";
import { StudentParticipationHistoryResponse, StudentParticipationHistory } from "@/types/student";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, CurrencyIcon } from "lucide-react";

export default function ParticipationHistory() {
  const [historyData, setHistoryData] = useState<StudentParticipationHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchParticipationHistory();
  }, []);

  const fetchParticipationHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentService.getParticipationHistory();
      setHistoryData(data);
    } catch (error: any) {
      console.error("Error fetching participation history:", error);
      setError(error.message || "Có lỗi xảy ra khi tải lịch sử tham gia");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang diễn ra":
        return "bg-blue-100 text-blue-800";
      case "Chờ phê duyệt":
        return "bg-yellow-100 text-yellow-800";
      case "Sắp diễn ra":
        return "bg-purple-100 text-purple-800";
      case "Đã kết thúc - Chưa xác nhận":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredParticipations = historyData?.participations.filter(participation => {
    if (selectedStatus === "all") return true;
    return participation.status === selectedStatus;
  }) || [];

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "Đã hoàn thành", label: "Đã hoàn thành" },
    { value: "Đang diễn ra", label: "Đang diễn ra" },
    { value: "Chờ phê duyệt", label: "Chờ phê duyệt" },
    { value: "Sắp diễn ra", label: "Sắp diễn ra" },
    { value: "Đã kết thúc - Chưa xác nhận", label: "Đã kết thúc - Chưa xác nhận" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800">
          Lỗi khi tải lịch sử tham gia
        </h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          onClick={fetchParticipationHistory}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // No data state
  if (!historyData || historyData.participations.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Chưa có lịch sử tham gia
        </h3>
        <p className="mt-2 text-gray-500">
          Bạn chưa đăng ký tham gia hoạt động nào. Hãy khám phá các hoạt động có sẵn!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng số hoạt động
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {historyData.totalActivities}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Đã hoàn thành
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {historyData.completedActivities}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <CurrencyIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng coin kiếm được
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {historyData.totalCoinsEarned.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch sử tham gia ({filteredParticipations.length})
          </h2>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participation List */}
      <div className="space-y-4">
        {filteredParticipations.map((participation) => (
          <ParticipationCard key={participation.activityId} participation={participation} />
        ))}
      </div>

      {filteredParticipations.length === 0 && selectedStatus !== "all" && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">
            Không có hoạt động nào với trạng thái "{selectedStatus}"
          </p>
        </div>
      )}
    </div>
  );
}

// Participation Card Component
interface ParticipationCardProps {
  participation: StudentParticipationHistory;
}

function ParticipationCard({ participation }: ParticipationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang diễn ra":
        return "bg-blue-100 text-blue-800";
      case "Chờ phê duyệt":
        return "bg-yellow-100 text-yellow-800";
      case "Sắp diễn ra":
        return "bg-purple-100 text-purple-800";
      case "Đã kết thúc - Chưa xác nhận":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Activity Image */}
          <div className="flex-shrink-0">
            <img
              src={participation.imageUrl || "/placeholder-activity.jpg"}
              alt={participation.activityName}
              className="w-full lg:w-32 h-32 object-cover rounded-lg"
            />
          </div>

          {/* Activity Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <h3 className="text-xl font-bold text-gray-900">
                {participation.activityName}
              </h3>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  participation.status
                )}`}
              >
                {participation.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2">
              {participation.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formatDate(participation.startDate)} - {formatDate(participation.endDate)}</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span>{participation.location}</span>
              </div>
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                <span>{participation.organizer}</span>
              </div>
              <div className="flex items-center">
                <CurrencyIcon className="h-4 w-4 mr-2" />
                <span>{participation.rewardCoin} coins</span>
              </div>
            </div>

            {/* Registration Timeline */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Đăng ký:</span>
                <span className="text-gray-900">{formatDateTime(participation.registeredAt)}</span>
              </div>
              
              {participation.isApproved && participation.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phê duyệt:</span>
                  <span className="text-green-600">{formatDateTime(participation.approvedAt)}</span>
                </div>
              )}
              
              {participation.isParticipationConfirmed && participation.participationConfirmedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Xác nhận tham gia:</span>
                  <span className="text-green-600">{formatDateTime(participation.participationConfirmedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reward Status */}
      {participation.rewardReceived && (
        <div className="bg-green-50 px-6 py-3 border-t border-green-200">
          <div className="flex items-center text-green-700">
            <CurrencyIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">
              Đã nhận thưởng {participation.rewardCoin} coins
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 