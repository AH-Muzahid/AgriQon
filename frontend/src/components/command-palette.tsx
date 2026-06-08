'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { navigationRegistry } from '@/lib/navigation';
import { useAuthStore } from '@/store/auth-store';
import { LucideIcon } from './lucide-icon';
import { Sparkles, Terminal, FilePlus2 } from 'lucide-react';
import { Permission } from '@/types/permission';

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { hasPermission } = useAuthStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Recurse to find all navigation pages
  const flattenedPages = React.useMemo(() => {
    const pages: { title: string; href: string; icon?: string; permission?: Permission }[] = [];
    
    const recurse = (items: typeof navigationRegistry) => {
      for (const item of items) {
        if (!item.permission || hasPermission(item.permission)) {
          // If it has no sub-items, it is a leaf page
          if (!item.items || item.items.length === 0) {
            pages.push({
              title: item.title,
              href: item.href,
              icon: item.icon,
              permission: item.permission,
            });
          } else {
            // Include parent index itself
            pages.push({
              title: `${item.title} Overview`,
              href: item.href,
              icon: item.icon,
              permission: item.permission,
            });
            recurse(item.items);
          }
        }
      }
    };

    recurse(navigationRegistry);
    return pages;
  }, [hasPermission]);

  // Recurse to find all quick-create actions
  const quickCreates = React.useMemo(() => {
    const actions: { label: string; href: string; icon?: string; permission?: Permission }[] = [];
    
    const recurse = (items: typeof navigationRegistry) => {
      for (const item of items) {
        if (item.quickCreate && (!item.quickCreate.permission || hasPermission(item.quickCreate.permission))) {
          actions.push({
            label: item.quickCreate.label,
            href: item.href,
            icon: item.quickCreate.icon,
            permission: item.quickCreate.permission,
          });
        }
        if (item.items) {
          recurse(item.items);
        }
      }
    };

    recurse(navigationRegistry);
    return actions;
  }, [hasPermission]);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search routes..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Navigation Pages Group */}
        <CommandGroup heading="Navigation Routes">
          {flattenedPages.map((page) => (
            <CommandItem
              key={page.href}
              value={page.title}
              onSelect={() => handleSelect(page.href)}
              className="cursor-pointer gap-2"
            >
              <LucideIcon name={page.icon || 'Terminal'} className="h-4 w-4 text-muted-foreground" />
              <span>{page.title}</span>
              <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                {page.href}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Workflows Group */}
        {quickCreates.length > 0 && (
          <CommandGroup heading="Quick ERP Workflows">
            {quickCreates.map((action) => (
              <CommandItem
                key={action.label}
                value={action.label}
                onSelect={() => handleSelect(action.href)}
                className="cursor-pointer gap-2"
              >
                <LucideIcon name={action.icon || 'PlusCircle'} className="h-4 w-4 text-primary" />
                <span className="font-medium">{action.label}</span>
                <span className="ml-auto text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Action
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
export default CommandPalette;
