# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the Agriqon application.

## Prerequisites

- Google Cloud Console account
- Supabase project
- Frontend and backend running locally

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **Credentials** in the left sidebar
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose "External" as User Type
   - Fill in required fields (app name, user support email, etc.)
   - Add necessary scopes (email, profile)
6. Create OAuth credentials:
   - Application type: **Web application**
   - Name: "Agriqon" or similar
    - Add Authorized redirect URI (required by Supabase):
       - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
    - Do **not** add your frontend callback URL here.
   - Click **Create**
7. Copy the **Client ID** and **Client Secret**

## Step 2: Enable Google Provider in Supabase

1. Log in to [Supabase Dashboard](https://app.supabase.com/)
2. Go to **Authentication** → **Providers**
3. Find and enable **Google**
4. Enter the Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Click **Save**

## Step 2.1: Configure Redirect URLs in Supabase

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - `http://localhost:3000` (development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (production)

## Step 3: Configure Environment Variables

### Frontend (.env.local)

No additional environment variables needed - uses existing Supabase configuration:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Backend (.env.local)

No changes required. Backend uses existing JWT setup.

## Step 4: Test OAuth Flow

### Sign Up with Google

1. Open `http://localhost:3000/auth/signup`
2. Select account type (Buyer/Seller)
3. Click **Sign up with Google**
4. Complete Google login flow
5. You should be redirected to `/dashboard` with user profile loaded

### Sign In with Google

1. Open `http://localhost:3000/auth/login`
2. Click **Sign in with Google**
3. Complete Google login flow
4. You should be redirected to the homepage with logged-in state

## How OAuth Flow Works

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ 1. User clicks "Sign in with Google"
       ↓
┌──────────────────┐
│  Supabase Auth   │
└──────┬───────────┘
       │ 2. Redirect to Google login
       ↓
┌──────────────────┐
│  Google OAuth    │
└──────┬───────────┘
       │ 3. User authenticates
       ↓
   Google returns ID token + user info
       │
       ↓
┌──────────────────┐
│  Frontend Auth   │
│  Callback Page   │
└──────┬───────────┘
       │ 4. Exchange token with backend
       ↓
┌────────────────┐
│  Backend API   │
│  oauth-callback│
└──────┬─────────┘
       │ 5. Create or find user
       ↓
   Return user + JWT token
       │
       ↓
   Store token, redirect to dashboard
```

## Troubleshooting

### "Redirect URI mismatch" or "invalid_client"
- Check Google OAuth Authorized redirect URI is exactly:
   - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
- Ensure Google Client ID and Client Secret in Supabase match the same Google app
- Ensure OAuth client type is **Web application** (not Desktop)
- Ensure your frontend callback URL is configured in Supabase URL Configuration (not in Google redirect URIs)

### "User not created after OAuth"
- Check backend logs at `http://localhost:4000`
- Verify the `/api/auth/oauth-callback` endpoint is responding
- Ensure backend has correct database connection

### "OAuth session expires"
- Token expiry is set to 7 days in backend (`auth.service.ts`)
- Users need to sign in again after token expires

### "Role not being set"
- Ensure you select a role (Buyer/Seller) before clicking OAuth button
- The role is passed via query parameter: `?role=SELLER`

## Security Considerations

1. **Client Secret**: Never expose Google Client Secret in frontend
2. **OAuth Token**: Stored in localStorage (consider using HTTP-only cookies in production)
3. **User Creation**: Only happens on first OAuth login, subsequent logins use existing user
4. **Role Assignment**: Determined by user selection during OAuth signup, cannot be changed via OAuth signin

## Production Deployment

When deploying to production:

1. Update Google OAuth authorized redirect URIs:
   - Keep only: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`

2. Update Supabase site URL:
   - Go to Authentication → URL Configuration
   - Set Site URL to your production domain

3. Configure backend environment:
   - Update `FRONTEND_ORIGIN` to your production URL
   - Ensure CORS is properly configured

4. Update HTTPS redirect in production frontend

## Files Modified

- `frontend/src/context/auth-context.tsx` - Added OAuth methods
- `frontend/src/app/auth/login/page.tsx` - Added Google sign-in button
- `frontend/src/app/auth/signup/page.tsx` - Added Google sign-up button
- `frontend/src/app/auth/callback/page.tsx` - OAuth callback handler
- `backend/src/modules/auth/auth.controller.ts` - Added OAuth endpoint
- `backend/src/modules/auth/auth.service.ts` - Added OAuth user creation logic
- `backend/src/modules/auth/auth.routes.ts` - Added OAuth route

## References

- [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
