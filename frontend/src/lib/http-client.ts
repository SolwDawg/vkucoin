"use client";

import { authService } from "@/services/auth.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5219/api";

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

export async function httpClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...customOptions } = options;

  // Default headers
  const headers = new Headers(customOptions.headers);

  // Don't set Content-Type if it's FormData (browser will set it with boundary)
  if (!customOptions.body || !(customOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Add auth header if required and available
  if (requireAuth) {
    const token = authService.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Prepare the URL
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  // Make the request
  try {
    const response = await fetch(url, {
      ...customOptions,
      headers,
    });

    // Handle no content responses
    if (response.status === 204) {
      return {} as T;
    }

    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (error) {
      // If the response can't be parsed as JSON, return an empty object
      data = {};
    }

    // Handle error responses
    if (!response.ok) {
      const error = new Error(
        data.message || "An error occurred while making the request"
      ) as ApiError;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const networkError = new Error(
        "Network error, please check your connection"
      ) as ApiError;
      networkError.status = 0;
      throw networkError;
    }
    throw error;
  }
}

// Helper methods for common HTTP methods
export const http = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    httpClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    httpClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  postFormData: <T = any>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ) =>
    httpClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    httpClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    httpClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    httpClient<T>(endpoint, { ...options, method: "DELETE" }),
};
