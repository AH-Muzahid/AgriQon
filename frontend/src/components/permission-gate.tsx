import React, { ReactNode } from 'react';
import { Permission } from '@/types/permission';
import { useAuthStore } from '@/store/auth-store';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  noAlert?: boolean;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
  noAlert = false,
}: PermissionGateProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (noAlert) {
      return null;
    }
    return (
      <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-semibold text-destructive">Access Restricted</h3>
        <p className="mt-2 text-xs text-muted-foreground max-w-sm">
          You do not have the required permission ({permission}) to view this resource. Contact your administrator to upgrade your access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
