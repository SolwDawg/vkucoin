"use client";

import { http } from "@/lib/http-client";
import {
  ImportUsersResponse,
  Activity,
  Student,
  UpdateStudentDto,
  UpdateStudentResponse,
} from "@/types/admin";

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

  // Get students by class
  async getStudentsByClass(className: string): Promise<{
    className: string;
    totalStudents: number;
    students: Student[];
  }> {
    return http.get(`/admin/students-by-class/${className}`);
  },

  // Get a single student by studentCode
  async getStudentByCode(studentCode: string): Promise<Student> {
    // Since there's no direct endpoint for getting a student by code,
    // we'll try to find the student's class and then filter from the list
    try {
      // We'll use the update-student endpoint directly to check if student exists
      // and get data from the response
      const response = await http.put<UpdateStudentResponse>(
        `/admin/update-student/${studentCode}`,
        {}
      );

      // If we get here, we didn't throw an error, so student exists
      // Create a Student object from the response data
      return {
        studentCode,
        fullName: response.updated.fullName,
        email: response.updated.email,
        dateOfBirth: response.updated.dateOfBirth,
        class: response.updated.class,
        walletAddress: response.updated.address || "",
        walletBalance: 0, // We don't have this info from the update response
      };
    } catch (error: any) {
      // If the error is 404, student doesn't exist
      if (error.status === 404) {
        throw new Error("Student not found");
      }
      // Re-throw any other errors
      throw error;
    }
  },

  // Update a student
  async updateStudent(
    studentCode: string,
    data: UpdateStudentDto
  ): Promise<UpdateStudentResponse> {
    return http.put(`/admin/update-student/${studentCode}`, data);
  },

  // Delete a student
  async deleteStudent(studentCode: string): Promise<{
    message: string;
    deletedEmail: string;
    deletedWallet?: string;
  }> {
    return http.delete(`/admin/delete-student/${studentCode}`);
  },

  // Get activity registrations for a specific activity
  async getActivityRegistrations(activityId: string | number): Promise<any[]> {
    return http.get(`/admin/Activities/${activityId}/registrations`);
  },

  // Approve a student's registration for an activity
  async approveRegistration(
    activityId: string | number,
    studentCode: string
  ): Promise<any> {
    return http.post(`/admin/Activities/${activityId}/approve/${studentCode}`);
  },

  // Confirm a student's participation in an activity
  async confirmParticipation(
    activityId: string | number,
    studentCode: string
  ): Promise<any> {
    return http.post(
      `/admin/Activities/${activityId}/confirm-participation/${studentCode}`
    );
  },

  // Get all students
  async getAllStudents(): Promise<Student[]> {
    return http.get("/admin/students/all");
  },
};
