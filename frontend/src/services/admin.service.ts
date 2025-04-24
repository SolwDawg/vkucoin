"use client";

import { http } from "@/lib/http-client";
import { ImportUsersResponse } from "@/types/admin";

export const adminService = {
  async importUsers(file: File): Promise<ImportUsersResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // When sending FormData, we need to avoid setting Content-Type
    // The browser will automatically set the correct Content-Type with boundary
    return http.postFormData("/admin/import-users", formData);
  },
};
