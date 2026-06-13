'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { useAuthStore, translateBackendUser } from '@/store/auth-store';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function SuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No authentication token received from callback');
        }

        // Set the token FIRST so all subsequent requests include it
        apiClient.setToken(token);

        // Now fetch user profile using the bearer token.
        // The response interceptor already unwraps response.data,
        // so the result IS the API response body: { success, data, message }
        const apiResponse = await apiClient.get('/auth/me') as any;

        // apiResponse is already unwrapped by interceptor:
        // could be { success, data: { user fields } } or { id, email, ... } directly
        const userData = apiResponse?.data || apiResponse;

        if (!userData || !userData.id) {
          throw new Error('Failed to load user profile after authentication');
        }

        // Sync both auth systems
        setUser(userData);
        useAuthStore.getState().setUser(translateBackendUser(userData));
        setStatus('success');

        // Small delay for the success animation to show
        setTimeout(() => {
          if (userData.businessId) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }, 1200);
      } catch (err) {
        console.error('[AuthSuccess] Error setting up user session:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Session initialization failed');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative z-10 space-y-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex justify-center"
      >
        <div className="size-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          <div className="size-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black italic">
            A
          </div>
        </div>
      </motion.div>

      <div className="space-y-2">
        {status === 'loading' && (
          <>
            <div className="mx-auto text-emerald-600 flex justify-center">
              <Loader2 className="animate-spin" size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-4">Creating Session</h2>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Syncing your agricultural workspace...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto text-emerald-600 flex justify-center"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h2 className="text-xl font-black text-slate-900 mt-4">Welcome to AgriQon</h2>
            <p className="text-sm text-emerald-600 font-bold tracking-wide">Securely logged in. Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto text-red-500 flex justify-center"
            >
              <AlertCircle size={48} />
            </motion.div>
            <h2 className="text-xl font-black text-slate-900 mt-4">Session Error</h2>
            <p className="text-sm text-red-500 font-medium">{error}</p>
            <p className="text-xs text-slate-400 mt-2 italic">Redirecting to login...</p>
          </>
        )}
      </div>

      <div className="pt-8">
        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: status === 'success' ? "100%" : status === 'error' ? "100%" : "60%" }}
            transition={{ duration: 2 }}
            className={`h-full ${status === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}
          />
        </div>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="relative w-full max-w-sm p-8 text-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50" />
        
        <Suspense fallback={
          <div className="relative z-10 space-y-6">
            <div className="flex justify-center">
              <div className="size-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <div className="size-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black italic">
                  A
                </div>
              </div>
            </div>
            <div className="mx-auto text-emerald-600 flex justify-center">
              <Loader2 className="animate-spin" size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Loading workspace...</h2>
          </div>
        }>
          <SuccessHandler />
        </Suspense>
      </div>
    </div>
  );
}
