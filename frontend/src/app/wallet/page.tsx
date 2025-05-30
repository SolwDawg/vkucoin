"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet as WalletIcon,
  RefreshCw,
  History,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { walletService } from "@/services/wallet.service";
import { toast } from "sonner";

export default function WalletPage() {
  const { user, isAuthenticated, wallet } = useAuth({
    requireAuth: true,
    redirectTo: "/login",
  });

  const refreshWalletBalance = useAuthStore(
    (state) => state.refreshWalletBalance
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    vkuBalance: number;
    tokenSymbol: string;
    contractAddress: string;
  } | null>(null);

  // Function to refresh wallet balance using our store method
  const handleRefreshBalance = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshWalletBalance();
      toast.success("Số dư ví đã được cập nhật thành công");
    } catch (error) {
      console.error("Failed to refresh balance:", error);
      toast.error("Không thể cập nhật số dư ví");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to fetch wallet details
  const fetchWalletInfo = async () => {
    try {
      const info = await walletService.getWalletInfo();
      setWalletInfo(info);
    } catch (error) {
      console.error("Failed to fetch wallet info:", error);
    }
  };

  // Effect to refresh wallet balance periodically (every 30 seconds)
  useEffect(() => {
    // Initial refreshes
    handleRefreshBalance();
    fetchWalletInfo();

    // Set up interval for periodic refreshes
    const intervalId = setInterval(handleRefreshBalance, 30000);

    // Refresh when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleRefreshBalance();
        fetchWalletInfo();
      }
    };

    // Add listener for custom wallet update events
    const handleWalletUpdate = () => {
      handleRefreshBalance();
      fetchWalletInfo();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("wallet-balance-updated", handleWalletUpdate);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("wallet-balance-updated", handleWalletUpdate);
    };
  }, []);

  if (!user || !isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Ví của tôi</h1>

        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">
              Số dư ví
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshBalance}
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Đang làm mới..." : "Làm mới"}
              </Button>
              <WalletIcon className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              {wallet?.balance || 0} VKU
            </div>

            {walletInfo && (
              <div className="text-sm text-muted-foreground mt-4">
                <p className="mb-1">
                  <span className="font-medium">Địa chỉ ví:</span>{" "}
                  {walletInfo.address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
