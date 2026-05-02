   background-color: #f8f8f8;

## Answer: Yes, Google Cloud Console is REQUIRED

Supabase acts as an authentication broker, but the actual OAuth credentials must be created in Google Cloud Console. Google needs to verify the Client ID before granting access.

## Step-by-Step Setup

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project** in the top dropdown
3. **Navigate to Credentials** (in left sidebar, under "APIs & Services")
4. **Click "Create Credentials"** → **OAuth client ID**
5. **Configure OAuth consent screen** (if prompted):
   - User Type: "External"
   - App name: "Agriqon"
   - User support email: your Gmail address
   - Add scopes: "email" and "profile"
   - Save
6. **Create OAuth client**:
   - Application type: **Web application**
   - Name: "Agriqon Web"
   - **Authorized redirect URIs**: 
     - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
     - (Replace `<YOUR-PROJECT-REF>` with your actual Supabase project reference)
   - Click "Create"
7. **Copy the Client ID and Client Secret**

### Step 2: Configure in Supabase

1. **Go to Supabase Dashboard**: https://app.supabase.com/
2. **Select your project**
3. **Go to Authentication** → **Providers**
4. **Find Google** and enable it
5. **Enter credentials**:
   - Client ID: Paste the Google Client ID
   - Client Secret: Paste the Google Client Secret
6. **Click Save**

### Step 3: Configure Redirect URLs in Supabase

1. **Go to Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:3000` (for development)
3. **Add Redirect URLs**:
   - `http://localhost:3000/auth/callback`

### Step 4: Environment Variables

Update your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT-REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Common Errors and Fixes

### Error 401: invalid_client
**Cause:** Google doesn't recognize the Client ID
**Fix:** 
- Verify the Client ID is correct in Supabase
- Ensure the OAuth consent screen is "Published" (or your Gmail is added as a test user)

### Redirect URI mismatch
**Cause:** Redirect URI doesn't match
**Fix:** Ensure exactly: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`

### Consent required
**Cause:** App is not published and user is not a test user
**Fix:** Add your Gmail as a test user in Google Cloud Console → APIs & Services → OAuth consent screen → Test users

## Important: Start Both Servers

You need TWO terminals running:

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```
Server runs at http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```
Server runs at http://localhost:3000

## Quick Checklist

- [ ] Created project in Google Cloud Console
- [ ] Created OAuth client ID (Web application)
- [ ] Added redirect URI in format: `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
- [ ] Enabled Google provider in Supabase
- [ ] Entered Client ID and Client Secret in Supabase
- [ ] (For unpublished apps) Added test user in GCC
- [ ] Backend server running at localhost:4000
- [ ] Frontend server running at localhost:3000

## Key Error in Your Logs

```
net::ERR_CONNECTION_REFUSED at :4000/api/auth/oauth-callback
```

This means **backend is not running**. Start the backend in Terminal 1:
```bash
cd backend && npm run dev
```

Then try signing in with Google again.
