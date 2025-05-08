"use client";

import { create } from "zustand";
import { AuthState, LoginResponse } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { walletService } from "@/services/wallet.service";

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (data: LoginResponse) => void;
  initializeFromStorage: () => void;
  refreshWalletBalance: () => Promise<void>;
}

// Helper to safely parse localStorage items
const getStorageItem = (key: string) => {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  user: null,
  wallet: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

      // Store in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("wallet", JSON.stringify(response.wallet));

      // Update store
      set({
        token: response.token,
        user: response.user,
        wallet: response.wallet,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("wallet");

    set({
      token: null,
      user: null,
      wallet: null,
      isAuthenticated: false,
    });
  },

  setAuth: (data: LoginResponse) => {
    // Store in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("wallet", JSON.stringify(data.wallet));

    set({
      token: data.token,
      user: data.user,
      wallet: data.wallet,
      isAuthenticated: true,
    });
  },

  initializeFromStorage: () => {
    const token = localStorage.getItem("token");
    const user = getStorageItem("user");
    const wallet = getStorageItem("wallet");

    if (token && user) {
      set({
        token,
        user,
        wallet,
        isAuthenticated: true,
      });
    }
  },

  refreshWalletBalance: async () => {
    try {
      const { wallet } = get();
      if (!wallet) return;

      // Sync wallet balance from blockchain
      const result = await walletService.syncWalletBalance();

      // Update wallet in state with new balance
      const updatedWallet = { ...wallet, balance: result.newBalance };

      // Update localStorage
      localStorage.setItem("wallet", JSON.stringify(updatedWallet));

      // Update store
      set({ wallet: updatedWallet });
    } catch (error) {
      console.error("Failed to refresh wallet balance:", error);
    }
  },
}));
