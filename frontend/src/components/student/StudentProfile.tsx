"use client";

import React from "react";
import { useStudentProfile } from "@/hooks/useStudentProfile";

export default function StudentProfile() {
  const { profile, isLoading, error } = useStudentProfile();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800">
          Error loading profile
        </h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <p className="mt-3 text-sm">
          Please try refreshing the page or contact support if the problem
          persists.
        </p>
      </div>
    );
  }

  // No data state
  if (!profile) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">No profile information available.</p>
      </div>
    );
  }

  // Format date
  const formattedBirthDate = new Date(profile.dateOfBirth).toLocaleDateString();

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold">{profile.fullName}</h2>
        <p className="text-blue-100">Student ID: {profile.studentCode}</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileItem label="Email" value={profile.email} />
          <ProfileItem label="Date of Birth" value={formattedBirthDate} />
          {profile.class && <ProfileItem label="Class" value={profile.class} />}
          {profile.wallet && (
            <>
              <ProfileItem
                label="Wallet Address"
                value={profile.wallet.address}
              />
              <ProfileItem
                label="Wallet Balance"
                value={`${profile.wallet.balance.toLocaleString() || "0"} VKU`}
                highlight={true}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for profile items
interface ProfileItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function ProfileItem({ label, value, highlight = false }: ProfileItemProps) {
  return (
    <div className="border-b pb-3">
      <div className="text-sm text-gray-500">{label}</div>
      <div
        className={`mt-1 font-medium ${highlight ? "text-blue-600" : "text-gray-800"}`}
      >
        {value}
      </div>
    </div>
  );
}
