"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeFromStorage } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage on app mount
    initializeFromStorage();
  }, [initializeFromStorage]);

  return <>{children}</>;
}
