"use client";

import {
  StudentProfile,
  StudentActivitiesResponse,
  RegistrationResponse,
  ConvertCoinResponse,
  StudentParticipationHistoryResponse,
} from "@/types/student";
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

  async getActivities(): Promise<StudentActivitiesResponse> {
    try {
      return await http.get<StudentActivitiesResponse>("/student/Student");
    } catch (error) {
      throw error;
    }
  },

  async registerForActivity(activityId: number): Promise<RegistrationResponse> {
    try {
      // Extra validation check
      if (!activityId) {
        throw new Error("Activity ID is required");
      }

      // Log request being made
      console.log(`Registering for activity: ${activityId}`);

      const response = await http.post<RegistrationResponse>(
        `/student/Student/${activityId}/register`
      );

      console.log("Registration response:", response);
      return response;
    } catch (error) {
      console.error("Error registering for activity:", error);
      throw error;
    }
  },

  async getActivityRegistrations(activityId: number): Promise<any[]> {
    try {
      if (!activityId) {
        throw new Error("Activity ID is required");
      }
      
      const response = await http.get<any[]>(`/student/Student/${activityId}/registrations`);
      return response;
    } catch (error) {
      console.error("Error fetching activity registrations:", error);
      throw error;
    }
  },

  async convertCoinsToPoints(amount: number): Promise<ConvertCoinResponse> {
    try {
      // Validate amount
      if (!amount || amount <= 0 || amount % 10 !== 0) {
        throw new Error("Amount must be a positive number divisible by 10");
      }

      console.log(`Converting ${amount} coins to points`);
      
      const response = await http.post<ConvertCoinResponse>(
        '/student/Student/convert-to-points', 
        { amount }
      );
      
      console.log("Conversion response:", response);
      return response;
    } catch (error) {
      console.error("Error converting coins to points:", error);
      throw error;
    }
  },

  async getParticipationHistory(): Promise<StudentParticipationHistoryResponse> {
    try {
      console.log("Fetching participation history");
      
      const response = await http.get<StudentParticipationHistoryResponse>('/student/Student/participation-history');
      
      console.log("Participation history response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching participation history:", error);
      throw error;
    }
  },
};
