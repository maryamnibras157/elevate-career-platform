export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'student' | 'admin' | 'recruiter';
  is_active: boolean;
  is_verified: boolean;
  is_oauth: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}
