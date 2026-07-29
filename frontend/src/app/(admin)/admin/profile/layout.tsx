'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Settings, ShieldCheck, MonitorSmartphone, Activity } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';

export default function AdminProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Account', href: '/admin/profile/account', icon: User },
    { name: 'Preferences', href: '/admin/profile/preferences', icon: Settings },
    { name: 'Security', href: '/admin/profile/security', icon: ShieldCheck },
    { name: 'Active Sessions', href: '/admin/profile/sessions', icon: MonitorSmartphone },
    { name: 'Activity', href: '/admin/profile/activity', icon: Activity },
  ];

  return (
    <PageShell
      title="Personal Profile"
      description="Manage your administrator account settings and preferences."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Profile' }
      ]}
    >
      <div className="flex flex-col md:flex-row gap-8 pb-12">
        <aside className="md:w-64 shrink-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </PageShell>
  );
}
