'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
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

        if (!cancelled && session?.user) {
          const response = await apiClient.client.get('/auth/me');
          setUser(response.data);
          apiClient.setToken(session.access_token);
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
      const response = await apiClient.login({ email, password });
      const { user: userData, token } = response.data;

      if (token) {
        localStorage.setItem('authToken', token);
        apiClient.setToken(token);
      }

      setUser(userData);
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
      const response = await apiClient.register({ email, password, name, role });
      const { user: userData, token } = response.data;

      if (token) {
        localStorage.setItem('authToken', token);
        apiClient.setToken(token);
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

