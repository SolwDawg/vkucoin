"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, GraduationCap, Award, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export default function StudentDashboard() {
  // Protect this route
  const { user, isAuthenticated, wallet } = useAuth({
    requireAuth: true,
    redirectTo: "/login",
  });

  const refreshWalletBalance = useAuthStore(
    (state) => state.refreshWalletBalance
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh wallet balance
  const handleRefreshBalance = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshWalletBalance();
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Effect to refresh wallet balance periodically (every 30 seconds)
  useEffect(() => {
    // Initial refresh
    handleRefreshBalance();

    // Set up interval for periodic refreshes
    const intervalId = setInterval(handleRefreshBalance, 30000);

    // Refresh when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleRefreshBalance();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (!user || !isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <h2 className="text-xl">Welcome, {user.fullName}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wallet Balance
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshBalance}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {wallet?.balance || 0} VKU
              </div>
              <p className="text-xs text-muted-foreground">
                Your current token balance
              </p>
              <Link
                href="/wallet"
                className="text-sm text-blue-500 hover:underline mt-2 inline-block"
              >
                Manage wallet
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Profile</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-medium">
                {user.studentCode || "No Student Code"}
              </div>
              <p className="text-xs text-muted-foreground">
                Update your academic information
              </p>
              <Link
                href="/student/profile"
                className="text-sm text-blue-500 hover:underline mt-2 inline-block"
              >
                View profile
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rewards</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-medium">Available Rewards</div>
              <p className="text-xs text-muted-foreground">
                View and claim your rewards
              </p>
              <Link
                href="/student/rewards"
                className="text-sm text-blue-500 hover:underline mt-2 inline-block"
              >
                View rewards
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
