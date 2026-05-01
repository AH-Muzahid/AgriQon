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
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user profile from backend
        try {
          const response = await apiClient.client.get('/auth/me');
          setUser(response.data);
          apiClient.setToken(session.access_token);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<User> {
    setIsLoading(true);
    try {
      const response = await apiClient.login({ email, password });
      const { user: userData, token } = response.data;

      // Store token
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

      // Store token
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

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, setUser }}>
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
