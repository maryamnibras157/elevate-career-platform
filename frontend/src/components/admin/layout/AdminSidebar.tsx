'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Target, BarChart3,
  Settings, ChevronLeft, ChevronRight, X,
  FileText, ShieldCheck, Bell, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/careers', label: 'Careers', icon: Target },
  { href: '/admin/resume-statistics', label: 'Resume Stats', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/reports', label: 'Reports', icon: Activity },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="font-semibold text-sm">ELEVATE Admin</span>
          </Link>
        )}
        {collapsed && (
          <div className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden h-6 w-6 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-secondary text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-4 pt-2 border-t border-border mt-auto">
        <Link
          href="/admin/settings"
          onClick={onMobileClose}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group',
            collapsed && 'justify-center px-2',
            pathname.startsWith('/admin/settings')
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
          title={collapsed ? "System Settings" : undefined}
        >
          <Settings className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
          {!collapsed && <span>System Settings</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-card border-r border-border transition-all duration-200 shrink-0 z-10',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
