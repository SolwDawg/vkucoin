"use client";

import { StudentProfile } from "@/types/student";
import { http } from "@/lib/http-client";

export const studentService = {
  async getProfile(): Promise<StudentProfile> {
    try {
      return await http.get<StudentProfile>("/student/Student");
    } catch (error) {
      throw error;
    }
  },
};
