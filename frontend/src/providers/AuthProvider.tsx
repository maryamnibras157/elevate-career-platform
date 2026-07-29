'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, AuthState } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

interface AuthContextType extends AuthState {
  login: (user: User, tokens: { access_token: string; refresh_token: string; token_type: string; expires_in: number }) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshUser = useCallback(async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const user = await authService.getMe();
      localStorage.setItem('cached_user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch {
      const cachedUser = localStorage.getItem('cached_user');
      if (cachedUser) {
        setState({ user: JSON.parse(cachedUser), isAuthenticated: true, isLoading: false });
      } else {
        authService.clearTokens();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (user: User, tokens: { access_token: string; refresh_token: string; token_type: string; expires_in: number }) => {
    authService.setTokens(tokens);
    localStorage.setItem('cached_user', JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Silent
    } finally {
      authService.clearTokens();
      localStorage.removeItem('cached_user');
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
