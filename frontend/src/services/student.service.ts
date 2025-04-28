"use client";

import { StudentProfile } from "@/types/student";
import { http } from "@/lib/http-client";
import { useAuthStore } from "@/store/auth.store";

export const studentService = {
  async getProfile(): Promise<StudentProfile> {
    try {
      // Get profile from auth store if available
      const { user, wallet } = useAuthStore.getState();

      if (user) {
        // Return profile from auth store
        return {
          id: user.id,
          studentCode: user.studentCode,
          fullName: user.fullName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          class: user.class,
          role: user.role,
          isStudent: user.isStudent,
          userName: user.userName,
          wallet: wallet || undefined,
        };
      }

      // Fallback to API call if not available in store
      return await http.get<StudentProfile>("/student/Student");
    } catch (error) {
      throw error;
    }
  },
};
