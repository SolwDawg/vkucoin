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
