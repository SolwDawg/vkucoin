"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { Activity, ActivityResponse } from "@/types/admin";
import {
  Calendar,
  Clock,
  Users,
  Coins,
  Save,
  AlertCircle,
  CheckCircle,
  MapPin,
  Image,
  User,
  Check,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ActivityFormProps {
  activityId?: string;
  mode: "create" | "edit";
}

// Status options for the dropdown
const STATUS_OPTIONS = [
  { value: "Active", label: "Đang hoạt động" },
  { value: "Upcoming", label: "Sắp diễn ra" },
  { value: "Completed", label: "Đã hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
];

export const ActivityForm = ({ activityId, mode }: ActivityFormProps) => {
  const router = useRouter();
  const [activity, setActivity] = useState<Activity>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    rewardCoin: 0,
    maxParticipants: 0,
    imageUrl: "",
    location: "",
    autoApprove: false,
    organizer: "",
    status: mode === "create" ? "Active" : "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch activity data if in edit mode
  useEffect(() => {
    const fetchActivity = async () => {
      if (mode === "edit" && activityId) {
        try {
          setIsFetching(true);
          const data = await adminService.getActivity(activityId);

          // Format dates for datetime-local input (yyyy-MM-ddThh:mm)
          const formattedStartDate = new Date(data.startDate)
            .toISOString()
            .slice(0, 16);
          const formattedEndDate = new Date(data.endDate)
            .toISOString()
            .slice(0, 16);

          setActivity({
            ...data,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            // Set default status if not provided from API
            status: data.status || "Active",
          });
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Đã xảy ra lỗi khi tải thông tin hoạt động"
          );
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchActivity();
  }, [activityId, mode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setActivity({
      ...activity,
      [name]:
        name === "rewardCoin" || name === "maxParticipants"
          ? parseInt(value) || 0
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    });
  };

  const validateForm = (): boolean => {
    if (!activity.name.trim()) {
      setError("Tên hoạt động là bắt buộc");
      return false;
    }

    if (!activity.description.trim()) {
      setError("Mô tả là bắt buộc");
      return false;
    }

    if (!activity.startDate) {
      setError("Ngày bắt đầu là bắt buộc");
      return false;
    }

    if (!activity.endDate) {
      setError("Ngày kết thúc là bắt buộc");
      return false;
    }

    if (new Date(activity.startDate) >= new Date(activity.endDate)) {
      setError("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }

    if (activity.rewardCoin <= 0) {
      setError("Số xu thưởng phải lớn hơn 0");
      return false;
    }

    if (activity.maxParticipants <= 0) {
      setError("Số người tham gia tối đa phải lớn hơn 0");
      return false;
    }

    if (!activity.location || !activity.location.trim()) {
      setError("Địa điểm là bắt buộc");
      return false;
    }

    if (!activity.organizer || !activity.organizer.trim()) {
      setError("Người tổ chức là bắt buộc");
      return false;
    }

    if (!activity.status) {
      setError("Trạng thái là bắt buộc");
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
      // Format dates to ISO string format
      const formattedActivity = {
        ...activity,
        startDate: new Date(activity.startDate).toISOString(),
        endDate: new Date(activity.endDate).toISOString(),
      };

      let response;

      if (mode === "create") {
        response = await adminService.createActivity(formattedActivity);
        setSuccess("Hoạt động đã được tạo thành công!");

        // Reset form after creation
        setActivity({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          rewardCoin: 0,
          maxParticipants: 0,
          imageUrl: "",
          location: "",
          autoApprove: false,
          organizer: "",
          status: "Active",
        });
      } else {
        if (!activityId) {
          throw new Error("Cần có ID hoạt động để cập nhật");
        }
        response = await adminService.updateActivity(
          activityId,
          formattedActivity
        );
        setSuccess("Hoạt động đã được cập nhật thành công!");

        // Navigate back to activities list after a short delay
        setTimeout(() => {
          router.push("/dashboard/admin/activities");
        }, 1500);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Đã xảy ra lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} hoạt động`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
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
            Đang tải thông tin hoạt động...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {mode === "create" ? "Tạo hoạt động mới" : "Chỉnh sửa hoạt động"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 p-4 rounded-lg text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-200 p-4 rounded-lg text-sm flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Tên hoạt động
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={activity.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập tên hoạt động"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={activity.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập mô tả hoạt động"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Ngày & Giờ bắt đầu</span>
                </div>
              </label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={activity.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>Ngày & Giờ kết thúc</span>
                </div>
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={activity.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="rewardCoin"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                <div className="flex items-center">
                  <Coins className="h-4 w-4 mr-1.5" />
                  <span>Số xu thưởng</span>
                </div>
              </label>
              <input
                id="rewardCoin"
                name="rewardCoin"
                type="number"
                min="1"
                value={activity.rewardCoin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="maxParticipants"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span>Số người tham gia tối đa</span>
                </div>
              </label>
              <input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="1"
                value={activity.maxParticipants}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              <div className="flex items-center">
                <Image className="h-4 w-4 mr-1.5" />
                <span>URL hình ảnh</span>
              </div>
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="text"
              value={activity.imageUrl || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập URL hình ảnh (tùy chọn)"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span>Địa điểm</span>
              </div>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={activity.location || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập địa điểm hoạt động"
              required
            />
          </div>

          <div>
            <label
              htmlFor="organizer"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1.5" />
                <span>Người tổ chức</span>
              </div>
            </label>
            <input
              id="organizer"
              name="organizer"
              type="text"
              value={activity.organizer || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập tên người tổ chức"
              required
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-1.5" />
                <span>Trạng thái</span>
              </div>
            </label>
            <select
              id="status"
              name="status"
              value={activity.status || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="" disabled>
                Chọn trạng thái
              </option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mt-2">
            <input
              id="autoApprove"
              name="autoApprove"
              type="checkbox"
              checked={activity.autoApprove || false}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="autoApprove"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-1.5" />
                <span>Tự động phê duyệt đăng ký</span>
              </div>
            </label>
          </div>

          <div className="pt-4 flex space-x-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/activities")}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg flex-1"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
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
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-1.5" />
                  {mode === "create" ? "Tạo hoạt động" : "Lưu thay đổi"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
