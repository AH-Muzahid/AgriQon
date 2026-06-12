'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Check, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface EntitySearchComboboxProps {
  endpoint: string;
  placeholder: string;
  value: string;
  onChange: (value: string, item?: any) => void;
  displayValue: (item: any) => string;
  className?: string;
}

export function EntitySearchCombobox({
  endpoint,
  placeholder,
  value,
  onChange,
  displayValue,
  className,
}: EntitySearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedLabel, setSelectedLabel] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch items from remote endpoint
  const fetchItems = useCallback(
    async (search: string) => {
      setLoading(true);
      try {
        const res = await apiClient.client.get(endpoint, {
          params: {
            search: search || undefined,
            limit: 10,
          },
        });
        const body = res.data || {};
        const list = body.data?.items || body.data || [];
        setItems(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to fetch combobox entities:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  // Debounced search trigger
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!open) return;

    timeoutRef.current = setTimeout(() => {
      fetchItems(searchTerm);
    }, 250);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchTerm, open, fetchItems]);

  // Initial fetch / display mapping on value change
  useEffect(() => {
    const resolveInitialValue = async () => {
      if (!value) {
        setSelectedLabel('');
        return;
      }
      try {
        // Find matching item in current list first
        const matched = items.find((item) => (item.id === value || item.sku === value));
        if (matched) {
          setSelectedLabel(displayValue(matched));
          return;
        }

        // Otherwise try direct fetch by id
        const res = await apiClient.client.get(`${endpoint}/${value}`);
        const body = res.data || {};
        const entity = body.data || body;
        if (entity) {
          setSelectedLabel(displayValue(entity));
        } else {
          setSelectedLabel(value);
        }
      } catch {
        setSelectedLabel(value);
      }
    };

    resolveInitialValue();
  }, [value, endpoint, displayValue]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    const val = item.id || item.sku || '';
    onChange(val, item);
    setSelectedLabel(displayValue(item));
    setOpen(false);
    setActiveIndex(-1);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
        fetchItems('');
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          handleSelect(items[activeIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) fetchItems('');
        }}
        onKeyDown={handleKeyDown}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left"
      >
        <span className={cn('truncate', !selectedLabel && 'text-muted-foreground')}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown Overlay */}
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-50 slide-in-from-top-1 flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2 bg-muted/20">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              autoFocus
              className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* List Area */}
          <div className="overflow-y-auto flex-1 p-1 max-h-48 space-y-0.5">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : items.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground italic">
                No items found
              </div>
            ) : (
              items.map((item, index) => {
                const itemId = item.id || item.sku;
                const isSelected = value === itemId;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors text-left hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent/40 font-medium',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                    <span className="truncate">{displayValue(item)}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
