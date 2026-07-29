'use client';

import Link from 'next/link';
import { Users, Briefcase, FileText, BarChart, Settings } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

export function DashboardQuickActions() {
  const { hasPermission } = useAdminStore();

  const actions = [
    { label: 'Manage Users', icon: Users, href: '/admin/users', permission: 'VIEW_USERS' },
    { label: 'Manage Careers', icon: Briefcase, href: '/admin/careers', permission: 'VIEW_CAREERS' },
    { label: 'Resume Statistics', icon: FileText, href: '/admin/resume-statistics', permission: 'VIEW_RESUME_STATS' },
    { label: 'View Analytics', icon: BarChart, href: '/admin/analytics', permission: 'VIEW_ANALYTICS' },
    { label: 'Settings', icon: Settings, href: '/admin/settings', permission: null },
  ];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, i) => {
          if (action.permission && !hasPermission(action.permission as any)) return null;
          
          return (
            <Link
              key={i}
              href={action.href}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
