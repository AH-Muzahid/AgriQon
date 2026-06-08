'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface DataTableColumn<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filters?: React.ReactNode;
  isLoading?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  filters,
  isLoading = false,
  emptyStateTitle = 'No records found',
  emptyStateDescription = 'Get started by creating your first entry.',
}: DataTableProps<T>) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Table Actions Header */}
      {(onSearchChange || filters) && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-10 bg-background"
              />
            </div>
          )}
          {filters && (
            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              {filters}
            </div>
          )}
        </div>
      )}

      {/* Main Table Card wrapper */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state skeletons
              Array.from({ length: 5 }).map((_, rIdx) => (
                <TableRow key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <TableCell key={cIdx}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground border">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm mt-2">{emptyStateTitle}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {emptyStateDescription}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Active table rows
              data.map((row, rIdx) => (
                <TableRow key={rIdx} className="hover:bg-muted/20 transition-colors">
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} className={col.className}>
                      {col.accessor(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold">1</span> to{' '}
            <span className="font-semibold">{data.length}</span> of{' '}
            <span className="font-semibold">{data.length}</span> entries
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default DataTable;
