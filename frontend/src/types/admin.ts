export interface UserImportResult {
  studentCode: string;
  fullName: string;
  email?: string;
  password?: string;
  walletAddress?: string;
  message: string;
}

export interface ImportUsersResponse {
  message: string;
  results: UserImportResult[];
}

export interface Activity {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  rewardCoin: number;
  maxParticipants: number;
}

export interface ActivityResponse {
  success: boolean;
  message: string;
  activity?: Activity;
}

export interface Student {
  studentCode: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  class?: string;
  walletAddress: string;
  walletBalance: number;
}

export interface UpdateStudentDto {
  fullName?: string;
  class?: string;
  dateOfBirth?: string;
  newEmail?: string;
}

export interface UpdateStudentResponse {
  message: string;
  original: {
    fullName: string;
    class?: string;
    dateOfBirth: string;
    email: string;
  };
  updated: {
    fullName: string;
    class?: string;
    dateOfBirth: string;
    email: string;
    address?: string;
  };
}
