"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { http } from "@/lib/http-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info, Users, QrCode, CheckCircle, XCircle, Loader2, Award } from "lucide-react";
import { ActivityQRCode } from "@/components/admin/ActivityQRCode";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default function ActivityDetailsPage() {
  // Ensure admin auth
  useAuth({ requireAuth: true });
  useAdminAuth();

  const params = useParams();
  const searchParams = useSearchParams();
  const activityId = params.id;
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [approvingStudents, setApprovingStudents] = useState<string[]>([]);
  const [confirmingStudents, setConfirmingStudents] = useState<string[]>([]);

  // Get the tab from URL if present, or default to 'details'
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam || 'details';

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await http.get(`/admin/activities/${activityId}`);
        setActivity(response);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
        toast.error("Failed to load activity details");
        setLoading(false);
      }
    };

    const fetchRegistrations = async () => {
      try {
        const response = await http.get(`/admin/activities/${activityId}/registrations`);
        setRegistrations(response);
      } catch (error) {
        console.error("Failed to fetch registrations:", error);
      }
    };

    if (activityId) {
      fetchActivity();
      fetchRegistrations();
    }

    // Listen for activity slots update events
    const handleActivityUpdate = (event: any) => {
      if (event.detail.activityId == activityId) {
        fetchRegistrations();
      }
    };

    window.addEventListener("activity-slots-updated", handleActivityUpdate);

    // Cleanup event listener
    return () => {
      window.removeEventListener("activity-slots-updated", handleActivityUpdate);
    };
  }, [activityId]);

  // Calculate remaining slots
  const approvedRegistrations = registrations.filter(reg => reg.isApproved).length;
  const remainingSlots = activity ? activity.maxParticipants - approvedRegistrations : 0;

  const handleApprove = async (registration: any) => {
    try {
      // Add studentCode to loading state
      setApprovingStudents((prev) => [
        ...prev,
        registration.student.studentCode,
      ]);

      // Call the API to approve the registration
      await http.post(`/admin/activities/${activityId}/approve/${registration.student.studentCode}`);

      // Show success toast
      toast.success(
        `Successfully approved ${registration.student.fullName}'s registration`
      );

      // Broadcast a custom event for activity slot updates
      const activityUpdateEvent = new CustomEvent("activity-slots-updated", {
        detail: {
          activityId: activityId,
        },
      });
      window.dispatchEvent(activityUpdateEvent);

      // Refresh the registrations list
      const response = await http.get(`/admin/activities/${activityId}/registrations`);
      setRegistrations(response);
    } catch (err) {
      console.error("Error approving registration:", err);
      toast.error("Failed to approve registration. Please try again.");
    } finally {
      // Remove studentCode from loading state
      setApprovingStudents((prev) =>
        prev.filter((code) => code !== registration.student.studentCode)
      );
    }
  };

  const handleConfirmParticipation = async (registration: any) => {
    try {
      // Add studentCode to loading state
      setConfirmingStudents((prev) => [
        ...prev,
        registration.student.studentCode,
      ]);

      // Call the API to confirm participation
      await http.post(`/admin/activities/${activityId}/confirm-participation/${registration.student.studentCode}`);

      // Show success toast
      toast.success(
        `Successfully confirmed ${registration.student.fullName}'s participation`
      );

      // Broadcast a custom event that wallet balances have changed
      const walletUpdateEvent = new CustomEvent("wallet-balance-updated", {
        detail: {
          studentCode: registration.student.studentCode,
          activityId: activityId,
        },
      });
      window.dispatchEvent(walletUpdateEvent);

      // Also broadcast activity slots update event
      const activityUpdateEvent = new CustomEvent("activity-slots-updated", {
        detail: {
          activityId: activityId,
        },
      });
      window.dispatchEvent(activityUpdateEvent);

      // Refresh the registrations list
      const response = await http.get(`/admin/activities/${activityId}/registrations`);
      setRegistrations(response);
    } catch (err) {
      console.error("Error confirming participation:", err);
      toast.error("Failed to confirm participation. Please try again.");
    } finally {
      // Remove studentCode from loading state
      setConfirmingStudents((prev) =>
        prev.filter((code) => code !== registration.student.studentCode)
      );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 mb-6 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!activity) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6">Không tìm thấy hoạt động</h1>
          <p>Hoạt động bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Activity Details: {activity.name}</h1>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Chi tiết
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Mã QR
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Đăng ký
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Tên</h3>
                    <p className="mt-1">{activity.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Trạng thái</h3>
                    <p className="mt-1">{activity.status}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Ngày bắt đầu</h3>
                    <p className="mt-1">{format(new Date(activity.startDate), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Ngày kết thúc</h3>
                    <p className="mt-1">{format(new Date(activity.endDate), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Địa điểm</h3>
                    <p className="mt-1">{activity.location}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Xu thưởng</h3>
                    <p className="mt-1">{activity.rewardCoins} xu</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Số chỗ còn lại</h3>
                    <p className="mt-1">{remainingSlots}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Tự động phê duyệt</h3>
                    <p className="mt-1">{activity.autoApprove ? "Có" : "Không"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Mô tả</h3>
                  <p className="mt-1">{activity.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcode">
            <ActivityQRCode activityId={Number(activityId)} activityName={activity.name} />
          </TabsContent>
          
          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>Sinh viên đã đăng ký</CardTitle>
                <CardDescription>
                  {registrations.length} student(s) registered for this activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">
                    Remaining slots: {remainingSlots} (of {activity.maxParticipants})
                  </Badge>
                  <Badge variant="outline">
                    {activity.rewardCoins} coins reward
                  </Badge>
                  <Badge>
                    {registrations.length} / {activity.maxParticipants} registered
                  </Badge>
                </div>
                
                {registrations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No registrations found for this activity.
                  </div>
                ) : (
                  <RegistrationsTable 
                    registrations={registrations}
                    approvingStudents={approvingStudents}
                    confirmingStudents={confirmingStudents}
                    onApprove={handleApprove}
                    onConfirmParticipation={handleConfirmParticipation}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 