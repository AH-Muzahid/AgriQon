'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Dev mode bypass for seamless local demo viewing
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development'
  );

  useEffect(() => {
    if (!isLoading && !user && !isDev) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router, isDev]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-full border-4 border-[#e8f3ec] border-t-[#0f4f3a] animate-spin"></div>
          <p className="text-xs font-bold text-[#0f4f3a]">লোডিং হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user && !isDev) {
    return null;
  }

  return <>{children}</>;
}

