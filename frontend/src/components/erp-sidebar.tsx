'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { navigationRegistry } from '@/lib/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useOrganizationStore } from '@/store/organization-store';
import { LucideIcon } from './lucide-icon';
import { LogOut, ChevronsUpDown, Building, User, Key, Settings } from 'lucide-react';

export function ErpSidebar() {
  const pathname = usePathname();
  const { user, hasPermission, logout } = useAuthStore();
  const { currentBusiness } = useOrganizationStore();

  // Filter navigation items based on permissions
  const filteredNavigation = React.useMemo(() => {
    return navigationRegistry
      .map((item) => {
        // If user doesn't have permission for parent, return null
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }

        // If it has sub-items, filter them too
        if (item.items) {
          const filteredItems = item.items.filter(
            (sub) => !sub.permission || hasPermission(sub.permission)
          );
          return {
            ...item,
            items: filteredItems,
          };
        }

        return item;
      })
      .filter((item): item is typeof navigationRegistry[0] => item !== null);
  }, [hasPermission]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon">
      {/* Business Switcher / Logo Header */}
      <SidebarHeader className="border-b border-sidebar-border/50 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Building className="h-4 w-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">
                        {currentBusiness?.name || 'Agriqon ERP'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {currentBusiness?.taxId || 'Multi-Tenant'}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" side="bottom" sideOffset={4}>
                <DropdownMenuLabel>Active Organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer font-medium">
                  <Building className="h-4 w-4" />
                  {currentBusiness?.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-muted-foreground">
                  Switch Tenant (Mock)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
            ERP Control Panel
          </SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavigation.map((item) => {
              const hasSubItems = item.items && item.items.length > 0;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <SidebarMenuItem key={item.href}>
                  {!hasSubItems ? (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={isActive ? 'bg-accent text-accent-foreground font-medium' : ''}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        {item.icon && <LucideIcon name={item.icon} className="h-4 w-4" />}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <React.Fragment>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={isActive ? 'text-primary font-medium' : 'text-muted-foreground'}
                      >
                        <div className="flex items-center gap-3 w-full cursor-pointer">
                          {item.icon && <LucideIcon name={item.icon} className="h-4 w-4" />}
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                      <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                        {item.items?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <SidebarMenuSubItem key={sub.href}>
                              <SidebarMenuSubButton
                                asChild
                                className={
                                  isSubActive
                                    ? 'bg-accent/80 text-accent-foreground font-semibold border-l-2 border-primary pl-2'
                                    : 'pl-3'
                                }
                              >
                                <Link href={sub.href}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </React.Fragment>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User Session Profile Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" side="top" sideOffset={4}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/organization/profile">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/settings">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
export default ErpSidebar;
