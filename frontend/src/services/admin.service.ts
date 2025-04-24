"use client";

import { http } from "@/lib/http-client";
import { ImportUsersResponse, Activity } from "@/types/admin";

export const adminService = {
  async importUsers(file: File): Promise<ImportUsersResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // When sending FormData, we need to avoid setting Content-Type
    // The browser will automatically set the correct Content-Type with boundary
    return http.postFormData("/admin/import-users", formData);
  },

  async createActivity(activityData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    rewardCoin: number;
    maxParticipants: number;
  }): Promise<any> {
    return http.post("/admin/Activities", activityData);
  },

  async getActivities(): Promise<Activity[]> {
    return http.get("/admin/Activities");
  },

  async getActivity(id: string): Promise<Activity> {
    return http.get(`/admin/Activities/${id}`);
  },

  async updateActivity(
    id: string,
    activityData: {
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      rewardCoin: number;
      maxParticipants: number;
    }
  ): Promise<any> {
    return http.put(`/admin/Activities/${id}`, activityData);
  },

  async deleteActivity(id: string): Promise<any> {
    return http.delete(`/admin/Activities/${id}`);
  },
};
