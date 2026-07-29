'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { adminApi } from '@/services/adminApi';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminTopNav } from '@/components/admin/layout/AdminTopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { adminContext, isLoadingContext, setAdminContext, setLoadingContext, setError } = useAdminStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        setLoadingContext(true);
        const res = await adminApi.getMe();
        if (res.success && res.data) {
          setAdminContext(res.data);
          setAuthChecked(true);
        } else {
          router.push('/dashboard');
        }
      } catch (err: any) {
        console.error('Failed to fetch admin context:', err);
        setError('Failed to authenticate as admin.');
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          router.push('/dashboard');
        }
      } finally {
        setLoadingContext(false);
      }
    };

    if (!adminContext) {
      fetchContext();
    } else {
      setAuthChecked(true);
      setLoadingContext(false);
    }
  }, [adminContext, router, setAdminContext, setError, setLoadingContext]);

  if (isLoadingContext || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!adminContext) {
    return null; 
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-background">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopNav onMobileMenuToggle={() => setMobileOpen(true)} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gray-50/50 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
