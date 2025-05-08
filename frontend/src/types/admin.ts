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
  imageUrl?: string;
  location?: string;
  autoApprove?: boolean;
  organizer?: string;
  status?: string;
}

export interface ActivityResponse {
  success: boolean;
  message: string;
  activity?: Activity;
}

export interface ActivityRegistration {
  id: number;
  studentId: string;
  student: {
    fullName: string;
    studentCode: string;
    class: string;
    dateOfBirth: string;
    role: string;
    isStudent: boolean;
    id: string;
    userName: string;
    email: string;
    emailConfirmed: boolean;
  };
  activityId: number;
  activity: Activity | null;
  registeredAt: string;
  isApproved: boolean;
  approvedAt: string | null;
  isParticipationConfirmed: boolean;
  participationConfirmedAt: string | null;
  evidenceImageUrl: string | null;
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
