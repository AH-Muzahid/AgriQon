'use client';

import React, { useState } from 'react';
import { useOrgAuditLogs } from '@/services/query/hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  FileText,
  Users,
  ShoppingCart,
  CreditCard,
  Settings,
  Search,
} from 'lucide-react';

export function RecentActivityFeed() {
  const { data: logs, isLoading } = useOrgAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');

  const getModuleIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case 'auth':
        return <ShieldCheck className="h-4 h-4 text-emerald-500" />;
      case 'inventory':
        return <Package className="h-4 h-4 text-amber-500" />;
      case 'invoices':
        return <FileText className="h-4 h-4 text-blue-500" />;
      case 'team':
        return <Users className="h-4 h-4 text-purple-500" />;
      case 'orders':
        return <ShoppingCart className="h-4 h-4 text-rose-500" />;
      case 'payments':
        return <CreditCard className="h-4 h-4 text-teal-500" />;
      default:
        return <Settings className="h-4 h-4 text-muted-foreground" />;
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const filteredLogs = logs?.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.user.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.module.toLowerCase().includes(term)
    );
  });

  return (
    <Card className="w-full border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 h-5 text-indigo-500" />
              Recent Operations Feed
            </CardTitle>
            <CardDescription>
              Real-time audit trails and business workflow activities
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs && filteredLogs.length > 0 ? (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div key={log.id}>
                {index > 0 && <Separator className="my-3 opacity-50" />}
                <div className="flex items-start gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 p-2 rounded-lg transition-colors">
                  <Avatar className="h-9 w-9 border border-neutral-200 dark:border-neutral-800">
                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {log.user.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {log.action}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {log.user}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {getModuleIcon(log.module)}
                        <span className="capitalize">{log.module}</span>
                      </span>
                      <span>•</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 px-1.5 ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No recent operational logs match your filter criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default RecentActivityFeed;
