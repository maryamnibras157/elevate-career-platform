'use client';

import { useTheme } from 'next-themes';
import { Menu, Moon, Sun, MonitorSmartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminStore } from '@/store/adminStore';
import { getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface AdminTopNavProps {
  onMobileMenuToggle: () => void;
}

export function AdminTopNav({ onMobileMenuToggle }: AdminTopNavProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { adminContext, setAdminContext } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAdminContext(null);
    toast.success('Signed out of admin console');
    router.push('/auth/login');
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4 gap-4 shrink-0 z-10 sticky top-0">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
        aria-label="Toggle Menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {/* Switch to User Dashboard */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-2 text-muted-foreground mr-2"
          asChild
        >
          <Link href="/dashboard">
            <MonitorSmartphone className="h-4 w-4" />
            <span>User View</span>
          </Link>
        </Button>

        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2 ml-1 focus-visible:ring-2 focus-visible:ring-primary">
              <Avatar className="h-6 w-6 border border-border">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  {adminContext ? getInitials(adminContext.full_name) : 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">
                {adminContext?.full_name?.split(' ')[0] || 'Admin'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{adminContext?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{adminContext?.email}</p>
                <div className="mt-1">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 uppercase">
                    {adminContext?.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile/account" className="w-full cursor-pointer">Account Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/profile/preferences" className="w-full cursor-pointer">Preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/profile/security" className="w-full cursor-pointer">Security</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={handleLogout} className="cursor-pointer">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
