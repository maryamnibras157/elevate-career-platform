'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Map, Target, BarChart3,
  BookOpen, Settings, ChevronLeft, ChevronRight, X,
  Sparkles, ListChecks, ArrowLeftRight, History, Heart, MessageSquare, Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/ai/recommendations', label: 'AI Recommendations', icon: Sparkles },
  { href: '/dashboard/ai/resume-analysis', label: 'Resume AI', icon: FileText },
  { href: '/dashboard/ai/skill-gap', label: 'Skill Gap', icon: ListChecks },
  { href: '/dashboard/ai/roadmap', label: 'AI Roadmap', icon: Map },
  { href: '/dashboard/careers', label: 'Career Discovery', icon: Target },
  { href: '/dashboard/mentor', label: 'AI Career Mentor', icon: MessageSquare },
  { href: '/dashboard/interview-prep', label: 'Interview Prep', icon: Mic },
  { href: '/dashboard/careers/compare', label: 'Compare Careers', icon: ArrowLeftRight },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/saved', label: 'Saved Careers', icon: Heart },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="font-semibold text-sm">ELEVATE</span>
          </Link>
        )}
        {collapsed && (
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
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
          const isActive = pathname === item.href;
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
            >
              <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-4">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <Settings className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-card border-r border-border transition-all duration-200 shrink-0',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
