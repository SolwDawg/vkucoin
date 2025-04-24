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
