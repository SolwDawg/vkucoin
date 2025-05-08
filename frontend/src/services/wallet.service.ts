"use client";

import { http } from "@/lib/http-client";

interface WalletBalanceResponse {
  message: string;
  oldBalance: number;
  newBalance: number;
  address: string;
}

interface WalletInfoResponse {
  address: string;
  vkuBalance: number;
  tokenSymbol: string;
  contractAddress: string;
}

export const walletService = {
  async syncWalletBalance(): Promise<WalletBalanceResponse> {
    try {
      const response = await http.post<WalletBalanceResponse>(
        "/wallet/sync-wallet"
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getWalletInfo(): Promise<WalletInfoResponse> {
    try {
      const response = await http.get<WalletInfoResponse>("/wallet/my-wallet");
      return response;
    } catch (error) {
      throw error;
    }
  },
};
