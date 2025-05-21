"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { StudentActivity } from "@/types/student";
import { formatDate, formatTime, formatDateTimeRange } from "@/lib/utils";

// Check if our UI components exist, otherwise define simple versions
let Card: React.FC<{
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}>;

try {
  Card = require("@/components/ui/card").Card;
} catch (e) {
  Card = ({ className, children, onClick }) => (
    <div
      className={`bg-white rounded-lg shadow-md p-4 ${className || ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Simple modal component
const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4">{children}</div>
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "đã kết thúc":
        return "bg-gray-100 text-gray-800";
      case "đang diễn ra":
        return "bg-green-100 text-green-800";
      case "sắp diễn ra":
        return "bg-blue-100 text-blue-800";
      case "đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

export const StudentActivities = () => {
  const queryClient = useQueryClient();

  const {
    data: activities,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studentActivities"],
    queryFn: studentService.getActivities,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">
          {error instanceof Error ? error.message : "Failed to load activities"}
        </span>
        <button
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No activities found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Activities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onRegistrationSuccess={() => {
              // Refetch activities after successful registration
              queryClient.invalidateQueries({
                queryKey: ["studentActivities"],
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Card component for individual activities
const ActivityCard = ({
  activity,
  onRegistrationSuccess,
}: {
  activity: StudentActivity;
  onRegistrationSuccess: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvedRegistrations, setApprovedRegistrations] = useState(0);
  const [loading, setLoading] = useState(false);
  // Registration mutation
  const [registrationStatus, setRegistrationStatus] = useState<{
    message: string;
    type: "success" | "error" | "none";
  }>({
    message: "",
    type: "none",
  });

  // Fetch the number of approved registrations
  useEffect(() => {
    const fetchRegistrationData = () => {
      if (isModalOpen) {
        setLoading(true);
        studentService
          .getActivityRegistrations(activity.id)
          .then((data) => {
            const approved = data.filter((reg: any) => reg.isApproved).length;
            setApprovedRegistrations(approved);
          })
          .catch((error) => {
            console.error("Error fetching registrations:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    // Initial fetch
    fetchRegistrationData();

    // Listen for activity slots update events
    const handleActivityUpdate = (event: any) => {
      if (event.detail.activityId == activity.id) {
        fetchRegistrationData();
      }
    };

    window.addEventListener("activity-slots-updated", handleActivityUpdate);

    // Cleanup event listener
    return () => {
      window.removeEventListener("activity-slots-updated", handleActivityUpdate);
    };
  }, [isModalOpen, activity.id]);

  // Calculate remaining slots
  const remainingSlots = activity.maxParticipants - approvedRegistrations;

  const registerMutation = useMutation({
    mutationFn: (activityId: number) =>
      studentService.registerForActivity(activityId),
    onSuccess: (data) => {
      setRegistrationStatus({
        message: data.message || "Registration successful!",
        type: "success",
      });
      onRegistrationSuccess();
    },
    onError: (error: any) => {
      let errorMessage = "Failed to register for activity";
      let isAlreadyRegistered = false;

      // Try to extract the specific error message from the API response
      if (error.data && error.data.message) {
        errorMessage = error.data.message;
        // Check if the error is about already being registered
        if (errorMessage.includes("đã đăng ký")) {
          isAlreadyRegistered = true;
          // Mark the activity as registered when we get this error
          activity.isRegistered = true;
          // Provide English translation
          errorMessage = "You have already registered for this activity";
        }
      } else if (error.message) {
        errorMessage = error.message;
        if (errorMessage.includes("đã đăng ký")) {
          isAlreadyRegistered = true;
          activity.isRegistered = true;
          // Provide English translation
          errorMessage = "You have already registered for this activity";
        }
      }

      console.error("Registration error:", error);

      setRegistrationStatus({
        message: errorMessage,
        type: isAlreadyRegistered ? "success" : "error",
      });

      // If the error was "already registered", we should refresh to update the UI
      if (isAlreadyRegistered) {
        onRegistrationSuccess();
      }
    },
  });

  // Determine if registration button should be disabled
  const canRegister =
    activity.status.toLowerCase() !== "đã kết thúc" &&
    activity.status.toLowerCase() !== "đã hủy" &&
    !activity.isRegistered;

  // Handle registration
  const handleRegister = () => {
    setRegistrationStatus({
      message: "",
      type: "none",
    });
    registerMutation.mutate(activity.id);
  };

  return (
    <>
      <Card
        className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative pb-[50%] bg-gray-200">
          {activity.imageUrl ? (
            <img
              src={activity.imageUrl}
              alt={activity.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
              <span className="text-white font-bold text-xl">
                {activity.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{activity.name}</h3>
            <ActivityStatusBadge status={activity.status} />
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {activity.description}
          </p>

          <div className="mt-auto space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {formatDateTimeRange(activity.startDate, activity.endDate)}
              </span>
            </div>

            {activity.location && (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="line-clamp-1">{activity.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{activity.rewardCoin} coins</span>
            </div>

            {/* Registration status indicator */}
            {activity.isRegistered && (
              <div className="mt-2">
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Registered
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Activity Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">{activity.name}</h2>
            <ActivityStatusBadge status={activity.status} />
          </div>

          {activity.imageUrl && (
            <img
              src={activity.imageUrl}
              alt={activity.name}
              className="w-full h-48 object-cover rounded-md"
            />
          )}

          <div>
            <h3 className="font-medium text-gray-700">Description</h3>
            <p className="text-gray-600 mt-1">{activity.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700">Date & Time</h3>
              <p className="text-gray-600 mt-1">
                {formatDateTimeRange(activity.startDate, activity.endDate)}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">Location</h3>
              <p className="text-gray-600 mt-1">
                {activity.location || "Not specified"}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">Reward</h3>
              <p className="text-gray-600 mt-1">{activity.rewardCoin} coins</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">Organizer</h3>
              <p className="text-gray-600 mt-1">
                {activity.organizer || "Not specified"}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">Remaining Slots</h3>
              <p className="text-gray-600 mt-1">
                {loading ? "Loading..." : `${remainingSlots} / ${activity.maxParticipants}`}
              </p>
            </div>
          </div>

          {/* Registration status message */}
          {registrationStatus.type !== "none" && (
            <div
              className={`text-sm p-3 rounded ${
                registrationStatus.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {registrationStatus.message}
            </div>
          )}

          {/* Registration action */}
          {activity.isRegistered ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              You are registered for this activity
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRegister();
              }}
              disabled={!canRegister || registerMutation.isPending}
              className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                canRegister && !registerMutation.isPending
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {registerMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Registering...
                </div>
              ) : (
                "Register for Activity"
              )}
            </button>
          )}

          {!canRegister && !activity.isRegistered && (
            <p className="text-sm text-gray-500 text-center mt-2">
              {activity.status.toLowerCase() === "đã kết thúc"
                ? "This activity has already ended"
                : activity.status.toLowerCase() === "đã hủy"
                  ? "This activity has been canceled"
                  : "Registration is not available"}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default StudentActivities;
