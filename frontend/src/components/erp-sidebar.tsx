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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { navigationRegistry } from '@/lib/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useOrganizationStore } from '@/store/organization-store';
import { LucideIcon } from './lucide-icon';
import { LogOut, ChevronsUpDown, Building, User, Settings, Plus, ChevronRight } from 'lucide-react';
import { Permission } from '@/types/permission';
import { useFeatures } from '@/hooks/use-subscription';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ErpSidebar() {
  const pathname = usePathname();
  const { user, hasPermission, logout } = useAuthStore();
  const { currentBusiness } = useOrganizationStore();
  const { data: features } = useFeatures();

  const isRouteLocked = React.useCallback((href: string) => {
    if (!features) return false;
    if (href === '/ai' && !features.AI_CHAT) return true;
    if (href === '/expenses' && !features.ACCOUNTING) return true;
    if (href === '/organization/warehouses' && !features.MULTI_BRANCH) return true;
    return false;
  }, [features]);

  // Filter navigation items based on permissions
  const filteredNavigation = React.useMemo(() => {
    return navigationRegistry
      .map((item) => {
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }

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

  // Dynamically extract all quick-create actions from navigation registry
  const quickCreateActions = React.useMemo(() => {
    const actions: { label: string; href: string; icon?: string; permission?: Permission }[] = [];
    
    const scan = (items: typeof navigationRegistry) => {
      for (const item of items) {
        if (item.quickCreate) {
          actions.push({
            label: item.quickCreate.label,
            href: item.href,
            icon: item.quickCreate.icon,
            permission: item.quickCreate.permission,
          });
        }
        if (item.items) {
          scan(item.items);
        }
      }
    };

    scan(navigationRegistry);
    return actions.filter((act) => {
      if (act.permission && !hasPermission(act.permission)) return false;
      if (isRouteLocked(act.href)) return false;
      return true;
    });
  }, [hasPermission, isRouteLocked]);

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
      <SidebarHeader className="border-b border-sidebar-border/50 py-3 gap-2">
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

        {/* Dynamic Quick Create Dropdown Menu */}
        {quickCreateActions.length > 0 && (
          <div className="px-1.5 py-1 group-data-[collapsible=icon]:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20 cursor-pointer font-bold shadow-none" 
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Quick Create</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" side="bottom" sideOffset={4}>
                <DropdownMenuLabel>ERP Schedulers</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickCreateActions.map((action) => (
                  <DropdownMenuItem key={action.label} asChild className="cursor-pointer gap-2">
                    <Link href={action.href}>
                      {action.icon && <LucideIcon name={action.icon} className="h-4 w-4 text-muted-foreground" />}
                      {action.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarHeader>

      {/* Collapsible Main Navigation */}
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
            ERP Control Panel
          </SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavigation.map((item) => {
              const hasSubItems = item.items && item.items.length > 0;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              if (!hasSubItems) {
                const locked = isRouteLocked(item.href);
                const buttonContent = (
                  <SidebarMenuButton
                    asChild={!locked}
                    tooltip={item.title}
                    className={`${isActive ? 'bg-accent text-accent-foreground font-medium' : ''} ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={locked}
                  >
                    {locked ? (
                      <div className="flex items-center gap-3 w-full text-muted-foreground select-none">
                        {item.icon && <LucideIcon name={item.icon} className="h-4 w-4" />}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        <span className="ml-auto text-xs group-data-[collapsible=icon]:hidden">🔒</span>
                      </div>
                    ) : (
                      <Link href={item.href} className="flex items-center gap-3">
                        {item.icon && <LucideIcon name={item.icon} className="h-4 w-4" />}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                );

                if (locked) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {buttonContent}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Upgrade to Professional Plan to unlock {item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    {buttonContent}
                  </SidebarMenuItem>
                );
              }

              // Collapsible Group for Items with Submenus
              return (
                <Collapsible
                  key={item.href}
                  asChild
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className={isActive ? 'text-primary font-medium' : ''}>
                        <div className="flex items-center gap-3 w-full">
                          {item.icon && <LucideIcon name={item.icon} className="h-4 w-4" />}
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                          <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          const subLocked = isRouteLocked(sub.href);
                          
                          const subButton = (
                            <SidebarMenuSubButton
                              asChild={!subLocked}
                              className={`${
                                isSubActive
                                  ? 'bg-accent/80 text-accent-foreground font-semibold border-l-2 border-primary pl-2'
                                  : 'pl-3'
                              } ${subLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              {subLocked ? (
                                <div className="flex items-center justify-between w-full text-muted-foreground select-none">
                                  <span>{sub.title}</span>
                                  <span className="text-[10px]">🔒</span>
                                </div>
                              ) : (
                                <Link href={sub.href}>{sub.title}</Link>
                              )}
                            </SidebarMenuSubButton>
                          );

                          if (subLocked) {
                            return (
                              <SidebarMenuSubItem key={sub.href}>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      {subButton}
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                      <p>Upgrade to Professional Plan to unlock {sub.title}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </SidebarMenuSubItem>
                            );
                          }

                          return (
                            <SidebarMenuSubItem key={sub.href}>
                              {subButton}
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
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
