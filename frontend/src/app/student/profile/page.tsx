"use client";

import React from "react";
import StudentProfile from "@/components/student/StudentProfile";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  // Ensure the user is authenticated
  useAuth({ requireAuth: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <StudentProfile />
    </div>
  );
}
