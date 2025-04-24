export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isStudent: boolean;
    userName: string;
  };
  wallet: {
    id: string;
    address: string;
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
