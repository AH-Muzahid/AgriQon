'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // Get the session from Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          throw new Error('No session found after OAuth');
        }

        // Extract provider from query params (do not trust client role)
        const urlParams = new URLSearchParams(window.location.search);
        const provider = urlParams.get('provider') || 'google';

        // Exchange token with backend to get user profile. Backend will set httpOnly cookie.
        try {
          const response = await apiClient.client.post('/auth/oauth-callback', {
            provider,
            idToken: session.access_token,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
          });

          const { user: userData } = response.data as { user: { id: string; email: string; name: string; role: 'USER' | 'SELLER' | 'ADMIN'; } };

          // Do not store token in localStorage; cookie is httpOnly
          setUser(userData);
          router.push('/');
        } catch (apiError) {
          console.error('Backend OAuth error:', apiError);
          router.push('/');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        console.error('OAuth callback error:', err);
        setError(errorMessage);
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [router, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}