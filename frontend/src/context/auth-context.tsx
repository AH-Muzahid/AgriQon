'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';
import { useAuthStore, translateBackendUser } from '@/store/auth-store';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'SELLER' | 'ADMIN' | 'MANAGER';
  businessId?: string | null;
  avatarUrl?: string | null;
}


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Skip auto-init on OAuth callback pages — the success page handles token setup.
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
          console.debug('[Auth init] On callback page, skipping auto /auth/me');
          if (!cancelled) setIsLoading(false);
          return;
        }

        // Check if there's a token in localStorage (set by prior login or OAuth callback)
        const hasToken = typeof window !== 'undefined' &&
          (localStorage.getItem('token') || localStorage.getItem('authToken'));

        if (!hasToken) {
          // No token available — user is not authenticated
          console.debug('[Auth init] No token in localStorage, skipping /auth/me');
          if (!cancelled) {
            setUser(null);
            useAuthStore.getState().setUser(null);
          }
          return;
        }

        if (!cancelled) {
          try {
            // The response interceptor already unwraps response.data,
            // so this returns the API body: { success, data: { ...user }, message }
            const apiResponse = await apiClient.client.get('/auth/me') as any;
            const userData = apiResponse?.data || apiResponse;

            if (userData && userData.id) {
              setUser(userData);
              useAuthStore.getState().setUser(translateBackendUser(userData));
            } else {
              setUser(null);
              useAuthStore.getState().setUser(null);
            }
          } catch (err) {
            // Not authenticated or endpoint failed
            console.debug('[Auth init] Failed to fetch /auth/me:', err);
            setUser(null);
            useAuthStore.getState().setUser(null);
          }
        }
      } catch (error) {
        console.error('[Auth init] Error:', error);
        if (!cancelled) {
          setUser(null);
          useAuthStore.getState().setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string): Promise<User> {
    setIsLoading(true);
    try {
      const response = await apiClient.login<{ user: User; token?: string; accessToken?: string }>({ email, password });
      // apiClient response interceptor unwraps axios response and returns `response.data`.
      const { user: userData, token, accessToken } = response.data;
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Auth] login response received', { url: '/auth/login', hasUser: !!userData, hasToken: !!(token || accessToken) });
      }
      const actualToken = token || accessToken;

      if (actualToken) {
        apiClient.setToken(actualToken);
      }

      // Backend sets cookies for the session; rely on cookie-based auth and
      // populate the frontend user state from backend response.
      setUser(userData);
      useAuthStore.getState().setUser(translateBackendUser(userData));
      console.log('[Auth] login successful, user set:', userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    setIsLoading(true);
    try {
      const response = await apiClient.register<{ user: User; token?: string; accessToken?: string }>({ email, password, name });
      // apiClient response interceptor unwraps axios response and returns `response.data`.
      const { user: userData, token, accessToken } = response.data;
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Auth] register response received', { url: '/auth/register', hasUser: !!userData, hasToken: !!(token || accessToken) });
      }
      const actualToken = token || accessToken;

      if (actualToken) {
        apiClient.setToken(actualToken);
      }

      setUser(userData);
      useAuthStore.getState().setUser(translateBackendUser(userData));
      return userData;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await apiClient.logout();
      // Clear any client-side state; backend clears cookies via /auth/logout.
      apiClient.setToken(null);
      setUser(null);
      useAuthStore.getState().logout();
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signUpWithGoogle() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        signInWithGoogle,
        signUpWithGoogle,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

