"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export function useAuth({
  requireAuth = false,
  redirectTo = "/login",
  redirectIfFound = false,
} = {}) {
  const {
    user,
    token,
    wallet,
    isAuthenticated,
    login,
    logout,
    initializeFromStorage,
  } = useAuthStore();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize auth from localStorage
    initializeFromStorage();

    // Get the callback URL from query parameters
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    // If auth is required and user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    // If redirectIfFound is true and user is authenticated, redirect to callback URL or dashboard
    if (redirectIfFound && isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [
    initializeFromStorage,
    isAuthenticated,
    pathname,
    redirectIfFound,
    redirectTo,
    requireAuth,
    router,
    searchParams,
  ]);

  // Custom login function that also handles redirection
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);

      // Get the callback URL from query parameters
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  // Custom logout function that handles redirection
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return {
    user,
    token,
    wallet,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };
}
