"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const refreshWalletBalance = useAuthStore(
    (state) => state.refreshWalletBalance
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Listen for wallet balance update events
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleWalletUpdate = () => {
      refreshWalletBalance();
    };

    // Add event listener for wallet balance updates
    window.addEventListener("wallet-balance-updated", handleWalletUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("wallet-balance-updated", handleWalletUpdate);
    };
  }, [isAuthenticated, refreshWalletBalance]);

  return <>{children}</>;
}
