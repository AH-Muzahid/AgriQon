# Frontend Authentication Setup

This document describes the authentication system implemented in the Agriqon frontend using Supabase Auth and JWT tokens.

## Architecture

### Authentication Flow

```
User (Browser)
    ↓
[/auth/login or /auth/signup]
    ↓
[apiClient.login/register]
    ↓
[Backend API] → Validates credentials → Returns JWT token
    ↓
[localStorage] → Stores token
    ↓
[AuthContext] → Sets user state
    ↓
[Redirect] → /dashboard (success) or show error
```

## Components

### 1. **Supabase Client** (`lib/supabase.ts`)
- Initializes Supabase browser client
- Loads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Handles Supabase session management

### 2. **API Client** (`lib/api-client.ts`)
- Axios instance with base URL pointing to backend API
- Automatically adds `Authorization: Bearer {token}` header
- Provides methods for: login, register, logout, items, orders, reviews, AI
- Token management via `setToken()`

### 3. **Auth Context** (`context/auth-context.tsx`)
- Global auth state management using React Context
- User object with: `id`, `email`, `name`, `role`
- Methods: `login()`, `register()`, `logout()`, `setUser()`
- Provides `useAuth()` hook for components
- Manages token persistence in localStorage

### 4. **Auth Pages**
- **Login** (`app/auth/login/page.tsx`): Email/password form
- **Signup** (`app/auth/signup/page.tsx`): Registration with role selection (USER/SELLER)
- **Dashboard** (`app/dashboard/page.tsx`): Protected route showing user profile

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx (protected layout)
│   │   │   └── page.tsx
│   │   ├── layout.tsx (root with AuthProvider)
│   │   └── page.tsx (marketplace with auth UI)
│   ├── context/
│   │   └── auth-context.tsx
│   └── lib/
│       ├── supabase.ts
│       └── api-client.ts
├── .env.local (local environment - not committed)
├── .env.example (template)
└── .gitignore
```

## Environment Variables

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**Note:** Variables starting with `NEXT_PUBLIC_` are sent to the browser. Never put secret keys here.

## Usage

### Using Authentication in Components

```typescript
'use client';

import { useAuth } from '@/context/auth-context';

export default function MyComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### Protected Routes

Wrap route layout with protection:

```typescript
// app/dashboard/layout.tsx
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return <>{children}</>;
}
```

### Making API Calls with Auth

```typescript
import { apiClient } from '@/lib/api-client';

// Automatically includes Authorization header
const items = await apiClient.getItems();
const orders = await apiClient.getOrders();
const review = await apiClient.createReview(data);
```

## Backend Integration

### Expected Backend Endpoints

- `POST /api/auth/login` - Login with email/password
  - Request: `{ email, password }`
  - Response: `{ user, token }`

- `POST /api/auth/register` - Sign up
  - Request: `{ email, password, name, role }`
  - Response: `{ user, token }`

- `POST /api/auth/logout` - Logout
  - Response: `{ success: true }`

- `GET /api/auth/me` - Get current user (protected)
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ user }`

### Token Format

Expected JWT structure in token claims:

```json
{
  "sub": "user-id",
  "role": "USER|SELLER|ADMIN",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Security Best Practices

✅ **DO:**
- Store tokens in secure HTTP-only cookies (production)
- Validate user session on app load
- Redirect to login if token expires
- Use HTTPS in production
- Keep env variables in `.env.local`
- Validate input before sending to API

❌ **DON'T:**
- Store sensitive tokens in localStorage (use cookies in production)
- Expose secret keys in client code
- Skip role-based access checks
- Trust token without backend verification
- Store user metadata in localStorage

## Future Enhancements

- [ ] OAuth 2.0 integration (Google, GitHub)
- [ ] Remember me functionality
- [ ] Automatic token refresh
- [ ] Social login
- [ ] Two-factor authentication
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management
- [ ] Rate limiting on login attempts

## Troubleshooting

### "Cannot find module 'supabase-js'"
```bash
npm install @supabase/supabase-js @supabase/ssr axios
```

### "useAuth must be used within an AuthProvider"
- Ensure `<AuthProvider>` wraps your app in layout
- Check that provider is marked with `'use client'`

### Token not persisting between page reloads
- Token is stored in localStorage on successful login
- Check browser DevTools → Application → Local Storage
- Verify `setToken()` is called after login

### API requests returning 401
- Token may have expired
- Check Authorization header is being sent
- Verify backend validates token correctly

## Testing Auth

### Login Test
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browser: Visit http://localhost:3000
# Click "Sign up" → Fill form → Click "Create account"
# You should be redirected to dashboard
```

### Protected Route Test
```bash
# Visit http://localhost:3000/dashboard while logged out
# Should redirect to login page
```

## Related Documentation

- [RBAC Implementation](../backend/RBAC-IMPLEMENTATION.md)
- [Backend Auth Routes](../backend/src/modules/auth/)
- [Supabase Docs](https://supabase.com/docs)
