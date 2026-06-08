import { Permission } from './permission';

export interface QuickCreateAction {
  label: string;
  permission?: Permission;
  icon?: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon?: string; // name of lucide-react icon
  permission?: Permission; // permission required to access
  quickCreate?: QuickCreateAction; // optional inline quick create config
  items?: NavigationItem[]; // nested sub-items
}

export interface NavigationRegistry {
  sidebar: NavigationItem[];
  quickLinks: NavigationItem[];
  settings: NavigationItem[];
}
