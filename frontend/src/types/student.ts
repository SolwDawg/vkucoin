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

export interface StudentActivitiesResponse {
  activities: StudentActivity[];
}

export interface RegistrationResponse {
  message: string;
  registration: any;
}

export interface ConvertCoinResponse {
  message: string;
  newBalance: number;
  newPoints: number;
  transactionHash: string;
}

export interface StudentParticipationHistory {
  activityId: number;
  activityName: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  rewardCoin: number;
  imageUrl: string;
  registeredAt: string;
  isApproved: boolean;
  approvedAt?: string;
  isParticipationConfirmed: boolean;
  participationConfirmedAt?: string;
  evidenceImageUrl?: string;
  status: string;
  rewardReceived: boolean;
}

export interface StudentParticipationHistoryResponse {
  participations: StudentParticipationHistory[];
  totalActivities: number;
  completedActivities: number;
  totalCoinsEarned: number;
}
