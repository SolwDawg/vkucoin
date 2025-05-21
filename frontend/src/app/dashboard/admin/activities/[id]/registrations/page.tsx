"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminService } from "@/services/admin.service";
import { ActivityRegistration, Activity } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowLeft, Loader2, Award } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { toast } from "sonner";

export default function ActivityRegistrationsPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  useAdminAuth();

  const { id } = useParams();
  const [registrations, setRegistrations] = useState<ActivityRegistration[]>(
    []
  );
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingStudents, setApprovingStudents] = useState<string[]>([]);
  const [confirmingStudents, setConfirmingStudents] = useState<string[]>([]);

  async function fetchRegistrations() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch activity details
      const activityData = await adminService.getActivity(id as string);
      setActivity(activityData);

      // Fetch registrations
      const registrationsData = await adminService.getActivityRegistrations(
        id as string
      );
      setRegistrations(registrationsData);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError("Failed to load registrations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchRegistrations();
    }
  }, [id]);

  const handleApprove = async (registration: ActivityRegistration) => {
    try {
      // Add studentCode to loading state
      setApprovingStudents((prev) => [
        ...prev,
        registration.student.studentCode,
      ]);

      // Call the API to approve the registration
      await adminService.approveRegistration(
        id as string,
        registration.student.studentCode
      );

      // Show success toast
      toast.success(
        `Successfully approved ${registration.student.fullName}'s registration`
      );

      // Broadcast a custom event for activity slot updates
      const activityUpdateEvent = new CustomEvent("activity-slots-updated", {
        detail: {
          activityId: id,
        },
      });
      window.dispatchEvent(activityUpdateEvent);

      // Refresh the registrations list
      await fetchRegistrations();
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

  const handleConfirmParticipation = async (
    registration: ActivityRegistration
  ) => {
    try {
      // Add studentCode to loading state
      setConfirmingStudents((prev) => [
        ...prev,
        registration.student.studentCode,
      ]);

      // Call the API to confirm participation
      await adminService.confirmParticipation(
        id as string,
        registration.student.studentCode
      );

      // Show success toast
      toast.success(
        `Successfully confirmed ${registration.student.fullName}'s participation`
      );

      // Broadcast a custom event that wallet balances have changed
      // This will be picked up by relevant components to refresh their data
      const walletUpdateEvent = new CustomEvent("wallet-balance-updated", {
        detail: {
          studentCode: registration.student.studentCode,
          activityId: id,
        },
      });
      window.dispatchEvent(walletUpdateEvent);

      // Also broadcast activity slots update event
      const activityUpdateEvent = new CustomEvent("activity-slots-updated", {
        detail: {
          activityId: id,
        },
      });
      window.dispatchEvent(activityUpdateEvent);

      // Refresh the registrations list
      await fetchRegistrations();
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

  // Calculate approved registrations and remaining slots
  const approvedRegistrations = registrations.filter(reg => reg.isApproved).length;
  const remainingSlots = activity ? activity.maxParticipants - approvedRegistrations : 0;

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Loading registrations...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <XCircle size={32} />
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchRegistrations()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/activities">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Activity Registrations</h1>
          </div>

          {activity && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{activity.name}</CardTitle>
                <CardDescription>
                  Start: {new Date(activity.startDate).toLocaleDateString()} -
                  End: {new Date(activity.endDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Remaining slots: {remainingSlots} (of {activity.maxParticipants})
                  </Badge>
                  <Badge variant="outline">
                    {activity.rewardCoin} coins reward
                  </Badge>
                  <Badge>
                    {registrations.length} / {activity.maxParticipants}{" "}
                    registered
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {registrations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No registrations found for this activity.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Registered Students</CardTitle>
                <CardDescription>
                  {registrations.length} student(s) registered for this activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Participation</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">
                          {registration.student.studentCode}
                        </TableCell>
                        <TableCell>{registration.student.fullName}</TableCell>
                        <TableCell>{registration.student.class}</TableCell>
                        <TableCell>
                          {format(new Date(registration.registeredAt), "PPp")}
                        </TableCell>
                        <TableCell>
                          {registration.isApproved ? (
                            <Badge
                              variant="success"
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {registration.isParticipationConfirmed ? (
                            <div>
                              <Badge
                                variant="success"
                                className="flex items-center gap-1 mb-1"
                              >
                                <Award className="h-3 w-3" />
                                Participated
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {format(
                                  new Date(
                                    registration.participationConfirmedAt!
                                  ),
                                  "PPp"
                                )}
                              </div>
                            </div>
                          ) : (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              Not Confirmed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {registration.evidenceImageUrl ? (
                            <Link
                              href={registration.evidenceImageUrl}
                              target="_blank"
                              className="text-blue-500 hover:underline"
                            >
                              View evidence
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">
                              No evidence
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!registration.isApproved && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(registration)}
                                disabled={approvingStudents.includes(
                                  registration.student.studentCode
                                )}
                                className="flex items-center gap-1"
                              >
                                {approvingStudents.includes(
                                  registration.student.studentCode
                                ) ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            )}

                            {registration.isApproved &&
                              !registration.isParticipationConfirmed && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleConfirmParticipation(registration)
                                  }
                                  disabled={confirmingStudents.includes(
                                    registration.student.studentCode
                                  )}
                                  className="flex items-center gap-1"
                                >
                                  {confirmingStudents.includes(
                                    registration.student.studentCode
                                  ) ? (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Confirming...
                                    </>
                                  ) : (
                                    <>
                                      <Award className="h-3 w-3" />
                                      Confirm Participation
                                    </>
                                  )}
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
