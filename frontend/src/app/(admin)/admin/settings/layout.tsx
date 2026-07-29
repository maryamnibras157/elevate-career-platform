'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Settings, Server, Cpu, Mail, Shield, Info } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';

const navigation = [
  { name: 'General', href: '/admin/settings/general', icon: Settings },
  { name: 'Platform (Feature Flags)', href: '/admin/settings/platform', icon: Server },
  { name: 'AI Settings', href: '/admin/settings/ai', icon: Cpu },
  { name: 'Email Settings', href: '/admin/settings/email', icon: Mail },
  { name: 'Security', href: '/admin/settings/security', icon: Shield },
  { name: 'System Information', href: '/admin/settings/system', icon: Info },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PageShell
      title="System Settings"
      description="Manage platform configuration, feature flags, and view system diagnostics."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Settings' }
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-8 pb-12">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (pathname === '/admin/settings' && item.href === '/admin/settings/general');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md flex-shrink-0 lg:flex-shrink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </PageShell>
  );
}
