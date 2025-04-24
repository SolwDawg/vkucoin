"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Function to check if a user is an admin
export const isAdmin = (user: any): boolean => {
  if (!user) return false;
  return user.role === "Admin";
};

// Hook to restrict access to admin routes
export const useAdminAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isAdmin(user)) {
      router.push("/dashboard");
    }
  }, [user, isAuthenticated, router]);

  return { isAdmin: isAdmin(user) };
};
