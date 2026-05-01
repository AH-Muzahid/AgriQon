# RBAC Implementation with Supabase

This document describes the Role-Based Access Control (RBAC) system implemented with Supabase Auth and Row Level Security (RLS).

## Architecture

### 1. Roles
```
- USER: Regular customer who can browse items and place orders
- SELLER: Can create/edit their own items and view their sales
- ADMIN: Full system access
```

### 2. Database Security
- **Row Level Security (RLS)** enabled on all tables
- **Policies** enforce access control at the database level
- User roles stored in `User.role` (Prisma) and `auth.users.raw_app_meta_data.role` (Supabase)

### 3. Application Flow

```
Client Request
    ↓
[Express] Extract JWT token from Authorization header
    ↓
[rbac.ts] Verify token and extract user info
    ↓
[AuthRequest.user] User context available to all routes
    ↓
[Middleware] Check role with authorize() or requireAuth()
    ↓
[Service/Controller] Ownership validation for resource access
    ↓
[Database] RLS policies enforce final access control
```

## Usage

### Basic Authentication Middleware
```typescript
// Routes automatically have access to req.user
import { requireAuth, authorize } from '../middleware/rbac';

// Protect route - require login
router.post('/orders', requireAuth, createOrder);

// Role-based access
router.post('/items', authorize('SELLER', 'ADMIN'), createItem);

// Admin only
router.get('/admin/logs', authorize('ADMIN'), getLogs);
```

### Ownership Validation
```typescript
import { checkOwnership, isAdmin } from '../middleware/rbac';

// Seller can edit their own items
const updateItem = async (req: AuthRequest, res: Response) => {
  const item = await prisma.item.findUnique({
    where: { id: req.params.id }
  });
  
  // Check ownership or admin
  if (!checkOwnership(item.sellerId, req) && !isAdmin(req)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  // Update item...
};
```

### Role Checking Helpers
```typescript
import { isSeller, isAdmin } from '../middleware/rbac';

if (isSeller(req)) {
  // User is seller or admin
}

if (isAdmin(req)) {
  // User is admin only
}
```

## Security Best Practices

### ✅ DO
- ✓ Check ownership before allowing updates/deletes
- ✓ Use `authorize()` middleware for role-based routes
- ✓ Store roles in `app_metadata` (not user_metadata)
- ✓ Validate user context in services
- ✓ Use RLS policies as the final gate

### ❌ DON'T
- ✗ Trust role from JWT without RLS policies (can be forged)
- ✗ Store authorization data in `user_metadata` (user-editable)
- ✗ Skip ownership validation for sensitive operations
- ✗ Disable RLS on sensitive tables
- ✗ Allow users to modify their own role

## Database Policies Summary

### User Table
- SELECT: Users see own record, service role sees all
- No INSERT/UPDATE/DELETE for users

### Item Table
- SELECT: Public (anyone can browse)
- INSERT: Sellers only
- UPDATE: Sellers own items only
- DELETE: Admins only

### Order Table
- SELECT: Users see own orders only
- INSERT: Authenticated users create for themselves
- UPDATE: Users update own orders only

### OrderItem & Review
- SELECT: Appropriate users only
- INSERT: Authenticated users only

### AiLog
- SELECT: Users see own logs, admins see all
- INSERT: Backend only (set by service)

## Implementation Checklist

- [x] Database schema with Role enum
- [x] RLS policies on all tables
- [x] RBAC middleware (`extractAuth`, `authorize`)
- [x] Ownership validation helpers
- [x] App integration with `extractAuth` middleware
- [x] Environment variables configured

## Next Steps

1. **Update Auth Service** - Integrate with Supabase Auth for JWT generation
2. **Update Controllers** - Add `authorize()` middleware to routes
3. **Add Tests** - Test RLS policies and ownership checks
4. **Monitor** - Check database logs for policy violations
5. **Rate Limiting** - Add per-role rate limits if needed

## Token Structure

Expected JWT claims:
```json
{
  "sub": "user-id",
  "role": "SELLER",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

The `extractAuth` middleware extracts `sub` as the user ID and expects a `role` claim.
Update your auth service to include these claims when generating tokens.
