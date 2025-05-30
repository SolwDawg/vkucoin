"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, GraduationCap, Award, RefreshCw, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export default function StudentDashboard() {
  const { user, isAuthenticated, wallet } = useAuth({
    requireAuth: true,
    redirectTo: "/login",
  });

  const refreshWalletBalance = useAuthStore(
    (state) => state.refreshWalletBalance
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useEffect(() => {
    handleRefreshBalance();

    const intervalId = setInterval(handleRefreshBalance, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleRefreshBalance();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

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
        <h1 className="text-2xl font-bold">Trang chủ sinh viên</h1>
        <h2 className="text-xl">Chào mừng, {user.fullName}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ví của tôi
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
                Số dư hiện tại của bạn
              </p>
              <Link
                href="/wallet"
                className="text-sm text-blue-500 hover:underline mt-2 inline-block"
              >
                Quản lý ví
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hồ sơ của tôi</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-medium">
                {user.fullName || "Không có tên"}
              </div>
              <div className="text-md font-medium">
                {user.studentCode || "Không có mã sinh viên"}
              </div>
              <p className="text-xs text-muted-foreground">
                Cập nhật thông tin học tập
              </p>
              <Link
                href="/student/profile"
                className="text-sm text-blue-500 hover:underline mt-2 inline-block"
              >
                Xem hồ sơ
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Điểm rèn luyện của tôi
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(wallet?.balance || 0) / 10} Điểm
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lịch sử tham gia
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-medium">
                Xem lịch sử hoạt động
              </div>
              <p className="text-xs text-muted-foreground">
                Theo dõi các hoạt động đã tham gia
              </p>
              <Link
                href="/student/activities/history"
                className="text-sm text-blue-500 hover:underline mt-2 inline-block"
              >
                Xem lịch sử
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
