import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  expandedGroups: string[];
  toggleGroup: (groupTitle: string) => void;
  setGroupExpanded: (groupTitle: string, expanded: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      notificationsOpen: false,
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      expandedGroups: [],
      toggleGroup: (groupTitle) =>
        set((state) => ({
          expandedGroups: state.expandedGroups.includes(groupTitle)
            ? state.expandedGroups.filter((g) => g !== groupTitle)
            : [...state.expandedGroups, groupTitle],
        })),
      setGroupExpanded: (groupTitle, expanded) =>
        set((state) => ({
          expandedGroups: expanded
            ? [...state.expandedGroups.filter((g) => g !== groupTitle), groupTitle]
            : state.expandedGroups.filter((g) => g !== groupTitle),
        })),
    }),
    {
      name: 'agriqon-ui-store', // key in localStorage
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        expandedGroups: state.expandedGroups,
      }), // only persist these fields
    }
  )
);
export default useUiStore;
