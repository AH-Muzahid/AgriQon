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
        // If we have a Supabase session, do NOT use Supabase access_token directly
        // (it may be signed with a different algorithm). The proper flow is to
        // exchange the idToken with the backend via /auth/oauth-callback which
        // will issue a backend-signed token. The callback page performs that
        // exchange after OAuth redirect; here we log for debugging and rely on
        // backend cookies/localStorage to be present instead.
        if (session?.access_token) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[Auth init] Supabase session present; skipping direct token set (will rely on backend exchange).', { supabaseUser: session.user?.email });
          }
        }

        // Do not rely on localStorage for tokens. Backend sets httpOnly cookies
        // which are sent automatically (`withCredentials: true`).

        if (!cancelled) {
          try {
            const response = await apiClient.client.get('/auth/me');
            setUser(response.data);
            useAuthStore.getState().setUser(translateBackendUser(response.data));
          } catch (err) {
            // Not authenticated or endpoint failed; log and clear user
            console.debug('Failed to fetch /auth/me:', err);
            setUser(null);
            useAuthStore.getState().setUser(null);
          }

        }
      } catch (error) {
        console.error('Error checking user:', error);
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
    name: string,
    role: 'USER' | 'SELLER' = 'USER'
  ): Promise<User> {
    setIsLoading(true);
    try {
      const response = await apiClient.register<{ user: User; token?: string; accessToken?: string }>({ email, password, name, role });
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

  async function signUpWithGoogle(role: 'USER' | 'SELLER') {
    setIsLoading(true);
    try {
      // Store intended role in sessionStorage and also pass it in redirectTo.
      // Passing it in redirectTo ensures the server-side callback handler can read it.
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

