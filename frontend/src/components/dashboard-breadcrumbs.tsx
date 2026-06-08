'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { navigationRegistry } from '@/lib/navigation';
import React from 'react';

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  if (pathname === '/dashboard') {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { title: string; href: string; isLast: boolean }[] = [];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Find in registry
    let title = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Check top-level registry items
    const match = navigationRegistry.find((item) => item.href === currentPath);
    if (match) {
      title = match.title;
    } else {
      // Check sub-items
      for (const item of navigationRegistry) {
        if (item.items) {
          const subMatch = item.items.find((sub) => sub.href === currentPath);
          if (subMatch) {
            title = subMatch.title;
            break;
          }
        }
      }
    }

    breadcrumbs.push({
      title,
      href: currentPath,
      isLast,
    });
  });

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap whitespace-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
export default DashboardBreadcrumbs;
