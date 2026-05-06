# Frontend Authentication Setup (Agriqon + Supabase + Backend JWT)

This guide matches the **current codebase** in `frontend/`.

## 0) What your system actually does (important)
This project does **not** rely purely on Supabase session cookies for app access.

Instead:
1) UI uses **Supabase Auth** only to obtain an OAuth session (Google) when needed.
2) For Email/Password + for OAuth callback, the frontend calls the **backend**.
3) Backend validates credentials / OAuth and returns a **JWT token**.
4) The frontend stores that JWT in **localStorage** and attaches it to API calls.
5) `AuthContext` fetches `/auth/me` (backend) to populate `{ id, email, name, role }`.

So your “Supabase Auth setup” is coupled to the backend contract:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `POST /api/auth/oauth-callback`

---

## 1) Supabase: Project + Auth Providers
### 1.1 Create a Supabase project
- Go to https://supabase.com → **New Project**
- Copy:
  - **Project URL**
  - **anon public key**

### 1.2 Enable Auth providers
Supabase Dashboard → **Authentication → Providers**
- **Email**: Enable
- **Google**: Enable (optional but recommended)

### 1.3 URL Configuration (for local dev)
Supabase Dashboard → **Authentication → URL Configuration**
- **Site URL**: `http://localhost:3000`
- **Redirect URL** (must match Supabase callback):
  - `http://localhost:3000/auth/callback`

> Note: Your OAuth flow uses a Next.js callback route at
> `frontend/src/app/auth/callback/page.tsx`.

---

## 2) Frontend setup
### 2.1 Install deps
In `frontend/`:
```bash
npm i @supabase/ssr @supabase/supabase-js
```

### 2.2 Supabase client file (already exists)
`frontend/src/lib/supabase.ts` uses `@supabase/ssr`:
- It expects:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

You should not edit this unless you change strategy.

### 2.3 Required environment variables
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 3) Auth flows (how to test)

### 3.1 Email/Password signup + login
Your UI pages:
- `frontend/src/app/auth/signup/page.tsx`
- `frontend/src/app/auth/login/page.tsx`

Flow:
- UI calls backend:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Backend returns `{ user, token }`
- Frontend stores token in `localStorage` and sets it in `apiClient`
- `AuthContext` loads user via `GET /api/auth/me`

#### Test checklist
- Start backend + frontend (see section 6)
- Visit:
  - `http://localhost:3000/auth/signup`
  - create account (choose Buyer/Seller)
  - ensure redirect works

> If you enabled Supabase Email verification in Supabase, your backend must be configured accordingly (otherwise backend login may fail).

---

### 3.2 Google OAuth (optional)
Your UI:
- Signup/login pages have a Google button

Flow:
1) Frontend triggers Supabase OAuth:
   - `supabase.auth.signInWithOAuth({ provider: 'google', options.redirectTo })`
2) Supabase redirects back to:
   - `http://localhost:3000/auth/callback`
3) `frontend/src/app/auth/callback/page.tsx` does:
   - `supabase.auth.getSession()`
   - extracts `session.access_token`
   - calls backend:
     - `POST /api/auth/oauth-callback`
     - payload includes `{ provider, idToken, email, name, role }`
4) Backend returns `{ user, token }`
5) Frontend stores token + redirects to `/dashboard`

#### IMPORTANT: Role propagation
- Seller/Buyer role is passed via query param:
  - `/auth/callback?role=SELLER` (or `USER`)
- The callback page reads `role` and forwards it to backend.

---

## 4) Protected routes (Dashboard)
Dashboard protection is already implemented in:
- `frontend/src/app/dashboard/layout.tsx`

It checks:
- `useAuth()` → if `!isLoading && !user` → redirect `/auth/login`

---

## 5) Backend contract (must match)
Frontend expects backend responses:

### 5.1 Login/Register
- `POST /api/auth/login`
- `POST /api/auth/register`

Response shape (as used in code):
```json
{ "user": {"id":"...","email":"...","name":"...","role":"USER|SELLER|ADMIN"}, "token": "..." }
```

### 5.2 Current user
- `GET /api/auth/me`

Response shape:
```json
{ "id":"...","email":"...","name":"...","role":"USER|SELLER|ADMIN" }
```

### 5.3 OAuth callback
- `POST /api/auth/oauth-callback`

Frontend sends:
- `provider`
- `idToken: session.access_token`
- `email`
- `name`
- `role`

Backend should create/find user and return `{ user, token }`.

---

## 6) Local run & testing
Run both servers:

### Terminal 1 (backend)
```bash
cd backend && npm run dev
```

### Terminal 2 (frontend)
```bash
cd frontend && npm run dev
```

Then test:
- Email signup/login:
  - http://localhost:3000/auth/signup
  - http://localhost:3000/auth/login
- Protected dashboard:
  - http://localhost:3000/dashboard (should redirect if logged out)
- Google OAuth:
  - use the Google button on login/signup

---

## 7) Security checks / common vulnerabilities to verify
This section is focused on **real risks** in the current architecture.

### 7.1 localStorage token risk (known tradeoff)
Current code stores JWT in `localStorage`:
- `AuthContext` sets `localStorage.setItem('authToken', token)`

Impact:
- XSS can steal token.

What to verify:
- Ensure you have strong Content Security Policy (CSP) in production.
- Ensure no user-generated HTML is injected unsafely.
- Avoid `dangerouslySetInnerHTML` with untrusted content.

### 7.2 Trust boundary: never trust client role
Client passes `role` during registration/OAuth.

What to verify (backend must enforce):
- Backend should not accept arbitrary `role` from the client without validation rules.
- Role must be derived from allowed flows or validated against server-side policy.

### 7.3 OAuth token validation
In `auth/callback/page.tsx` you send:
- `idToken: session.access_token`

What to verify (backend must enforce):
- Validate OAuth token properly with Google/Supabase.
- Don’t just decode it and trust payload blindly.

### 7.4 Protected API endpoints
What to verify:
- Backend endpoints must check JWT validity on every protected route.
- `GET /auth/me` must verify signature and expiry.

### 7.5 Redirect URI mismatch
OAuth will fail if Supabase URL configuration doesn’t match.

What to verify:
- Supabase URL config:
  - `Site URL: http://localhost:3000`
  - Redirect URL: `http://localhost:3000/auth/callback`
- Google OAuth redirect URLs should align with the Supabase provider configuration.

---

## 8) Troubleshooting
### “Missing Supabase environment variables”
- Check `frontend/.env.local` values:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### “401 from /api/auth/*”
- JWT missing or expired
- Backend not configured to validate the token
- Ensure `apiClient.setToken()` is called after login

### “OAuth callback fails”
- Confirm backend `/auth/oauth-callback` is reachable.
- Check backend logs.

---

## 9) Related files
- Supabase client: `frontend/src/lib/supabase.ts`
- Auth state: `frontend/src/context/auth-context.tsx`
- OAuth callback UI: `frontend/src/app/auth/callback/page.tsx`
- Dashboard protection: `frontend/src/app/dashboard/layout.tsx`

