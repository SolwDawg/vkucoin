"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RegistrationsRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id;

  useEffect(() => {
    // Redirect to the activity details page with the registrations tab selected
    router.replace(`/dashboard/admin/activities/${activityId}?tab=registrations`);
  }, [activityId, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p>Redirecting to registrations tab...</p>
      </div>
    </div>
  );
}
