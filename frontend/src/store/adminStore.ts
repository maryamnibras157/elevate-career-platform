import { create } from 'zustand';
import { AdminContextData, Permission } from '../types/admin';

interface AdminState {
  isSidebarCollapsed: boolean;
  adminContext: AdminContextData | null;
  isLoadingContext: boolean;
  error: string | null;

  setSidebarCollapsed: (collapsed: boolean) => void;
  setAdminContext: (context: AdminContextData | null) => void;
  setLoadingContext: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  dashboardFilterDays: number;
  dashboardPeriod: 'day' | 'week' | 'month';
  refreshTrigger: number;
  
  setDashboardFilterDays: (days: number) => void;
  setDashboardPeriod: (period: 'day' | 'week' | 'month') => void;
  triggerRefresh: () => void;

  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isSidebarCollapsed: false,
  adminContext: null,
  isLoadingContext: true,
  error: null,

  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setAdminContext: (context) => set({ adminContext: context, isLoadingContext: false, error: null }),
  setLoadingContext: (isLoading) => set({ isLoadingContext: isLoading }),
  setError: (error) => set({ error, isLoadingContext: false }),

  dashboardFilterDays: 30,
  dashboardPeriod: 'day',
  refreshTrigger: 0,

  setDashboardFilterDays: (days) => set({ dashboardFilterDays: days }),
  setDashboardPeriod: (period) => set({ dashboardPeriod: period }),
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

  hasPermission: (permission: Permission) => {
    const { adminContext } = get();
    if (!adminContext) return false;
    if (adminContext.role === 'SUPER_ADMIN') return true;
    return adminContext.permissions.includes(permission);
  },

  hasAnyPermission: (permissions: Permission[]) => {
    const { adminContext } = get();
    if (!adminContext) return false;
    if (adminContext.role === 'SUPER_ADMIN') return true;
    return permissions.some((p) => adminContext.permissions.includes(p));
  },

  hasAllPermissions: (permissions: Permission[]) => {
    const { adminContext } = get();
    if (!adminContext) return false;
    if (adminContext.role === 'SUPER_ADMIN') return true;
    return permissions.every((p) => adminContext.permissions.includes(p));
  }
}));
