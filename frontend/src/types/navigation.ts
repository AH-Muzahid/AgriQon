import { ReactNode } from 'react';
import { Permission } from './permission';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: string; // name of lucide-react icon
  permission?: Permission; // permission required to access
  items?: NavigationItem[]; // nested sub-items
}

export interface NavigationRegistry {
  sidebar: NavigationItem[];
  quickLinks: NavigationItem[];
  settings: NavigationItem[];
}
