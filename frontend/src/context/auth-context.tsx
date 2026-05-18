'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'SELLER' | 'ADMIN' | 'MANAGER';
  avatarUrl?: string | null;
}


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, role: 'USER' | 'SELLER') => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: (role: 'USER' | 'SELLER') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount (avoid react-hooks/set-state-in-effect by not calling async function directly)
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // If we have a Supabase session, set token first so apiClient sends auth header.
        if (session?.access_token) {
          apiClient.setToken(session.access_token);
        }

        // If token exists in localStorage (legacy or non-supabase auth), prefer it.
        const stored = localStorage.getItem('authToken');
        if (stored) {
          apiClient.setToken(stored);
        }

        if (!cancelled) {
          try {
            const response = await apiClient.client.get('/auth/me');
            setUser(response.data);
          } catch (err) {
            // Not authenticated or endpoint failed; log and clear user
            console.debug('Failed to fetch /auth/me:', err);
            setUser(null);
          }

        }
      } catch (error) {
        console.error('Error checking user:', error);
        if (!cancelled) setUser(null);
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
      const { user: userData, token, accessToken } = response.data;
      const actualToken = token || accessToken;

      if (actualToken) {
        localStorage.setItem('authToken', actualToken);
        apiClient.setToken(actualToken);
      }

      setUser(userData);
      console.log('[Auth] login successful, user set:', userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(
    email: string,
    password: string,
    name: string,
    role: 'USER' | 'SELLER' = 'USER'
  ): Promise<User> {
    setIsLoading(true);
    try {
      const response = await apiClient.register<{ user: User; token?: string; accessToken?: string }>({ email, password, name, role });
      const { user: userData, token, accessToken } = response.data;
      const actualToken = token || accessToken;

      if (actualToken) {
        localStorage.setItem('authToken', actualToken);
        apiClient.setToken(actualToken);
      }

      setUser(userData);
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
      localStorage.removeItem('authToken');
      apiClient.setToken(null);
      setUser(null);
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

  async function signUpWithGoogle(role: 'USER' | 'SELLER') {
    setIsLoading(true);
    try {
      sessionStorage.setItem('googleAuthRole', role);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
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

