import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role') || 'USER';
  const provider = searchParams.get('provider') || 'google';

  console.log(`[AuthCallback Route] Handling OAuth callback. Code present: ${!!code}, Role: ${role}, Provider: ${provider}`);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    try {
      console.log('[AuthCallback Route] Exchanging authorization code for session...');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error('[AuthCallback Route] Exchange error:', exchangeError);
        return NextResponse.redirect(`${origin}/auth/login?error=exchange_error&message=${encodeURIComponent(exchangeError.message)}`);
      }

      const session = data?.session;
      if (!session?.access_token) {
        console.error('[AuthCallback Route] No active session returned after code exchange.');
        return NextResponse.redirect(`${origin}/auth/login?error=no_session`);
      }

      console.log('[AuthCallback Route] Exchanging token with backend API...');
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      
      const response = await fetch(`${backendUrl}/auth/oauth-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          idToken: session.access_token,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          role,
        }),
      });

      const responseText = await response.text();
      console.log('[AuthCallback Route] Backend response text:', responseText);

      if (!response.ok) {
        console.error('[AuthCallback Route] Backend authentication failed:', response.status, responseText);
        return NextResponse.redirect(`${origin}/auth/login?error=backend_auth_failed&message=${encodeURIComponent(responseText)}`);
      }

      const parsedResponse = JSON.parse(responseText);
      if (!parsedResponse.success || !parsedResponse.data) {
        console.error('[AuthCallback Route] Backend returned unsuccessful response:', parsedResponse);
        return NextResponse.redirect(`${origin}/auth/login?error=backend_invalid_response`);
      }

      const { user } = parsedResponse.data;

      console.log('[AuthCallback Route] Successful backend authentication. Redirecting to success page...');

      // Backend already set httpOnly cookies; redirect to success page where
      // the client will fetch `/auth/me` to populate user state.
      return NextResponse.redirect(`${origin}/auth/callback/success`);
    } catch (err) {
      console.error('[AuthCallback Route] Internal server error handling callback:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.redirect(`${origin}/auth/login?error=callback_internal_error&message=${encodeURIComponent(msg)}`);
    }
  }

  console.warn('[AuthCallback Route] No code parameter found in callback URL.');
  return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
}
