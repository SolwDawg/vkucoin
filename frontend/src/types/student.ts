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
