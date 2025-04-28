export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  user: {
    id: string;
    userName: string;
    normalizedUserName: string;
    email: string;
    normalizedEmail: string;
    emailConfirmed: boolean;
    passwordHash: string;
    securityStamp: string;
    concurrencyStamp: string;
    phoneNumber: string | null;
    phoneNumberConfirmed: boolean;
    twoFactorEnabled: boolean;
    lockoutEnd: string | null;
    lockoutEnabled: boolean;
    accessFailedCount: number;
    fullName: string;
    studentCode: string;
    class: string;
    dateOfBirth: string;
    role: string;
    isStudent: boolean;
  };
  wallet: {
    id: number;
    address: string;
    privateKey: string;
    balance: number;
    userId: string;
  } | null;
}

export interface AuthState {
  token: string | null;
  user: LoginResponse["user"] | null;
  wallet: LoginResponse["wallet"] | null;
  isAuthenticated: boolean;
}
