export interface StudentProfile {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  class?: string;
  role: string;
  isStudent: boolean;
  userName: string;
  wallet?: {
    id: number;
    address: string;
    privateKey: string;
    balance: number;
    userId: string;
  };
}

export interface StudentActivity {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  rewardCoin: number;
  maxParticipants: number;
  isActive: boolean;
  imageUrl: string;
  location: string;
  organizer: string;
  allowedClasses: string[] | null;
  autoApprove: boolean;
  status: string;
  registrations: any[] | null;
  isRegistered?: boolean;
}

export type StudentActivitiesResponse = StudentActivity[];

export interface RegistrationResponse {
  success: boolean;
  message: string;
  registrationId?: number;
  status?: string;
}
