"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { http } from "@/lib/http-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Users, QrCode } from "lucide-react";
import { ActivityQRCode } from "@/components/admin/ActivityQRCode";
import { toast } from "sonner";

export default function ActivityDetailsPage() {
  // Ensure admin auth
  useAuth({ requireAuth: true });
  useAdminAuth();

  const params = useParams();
  const activityId = params.id;
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);

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
          <h1 className="text-2xl font-bold mb-6">Activity Not Found</h1>
          <p>The requested activity could not be found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Activity Details: {activity.name}</h1>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Activity Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Name</h3>
                    <p>{activity.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Status</h3>
                    <p>{activity.status}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Start Date</h3>
                    <p>{new Date(activity.startDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">End Date</h3>
                    <p>{new Date(activity.endDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Location</h3>
                    <p>{activity.location}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Reward Coins</h3>
                    <p>{activity.rewardCoin} VKU</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Remaining Slots</h3>
                    <p>{remainingSlots} (of {activity.maxParticipants})</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Auto Approve</h3>
                    <p>{activity.autoApprove ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Description</h3>
                  <p className="mt-1">{activity.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcode">
            <ActivityQRCode activityId={Number(activityId)} activityName={activity.name} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 