'use client';

import { useTheme } from 'next-themes';
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
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
import { useAuth } from '@/providers/AuthProvider';
import { getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { NotificationDropdown, Notification } from './NotificationDropdown';
import { GlobalSearch } from './GlobalSearch';

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Set notifications only on the client to avoid hydration mismatch
    setNotifications([
      { id: '1', title: 'Resume analyzed successfully', description: 'We found 5 new skills to add to your profile.', date: new Date().toISOString(), read: false },
      { id: '2', title: 'New AI recommendation', description: 'Frontend Developer match score increased to 92%.', date: new Date(Date.now() - 3600000).toISOString(), read: false },
      { id: '3', title: 'Career saved', description: 'You saved "Data Scientist" to your favorites.', date: new Date(Date.now() - 86400000).toISOString(), read: true },
    ]);

    // Attach global keyboard listener to the window in the capture phase to override browser shortcuts
    const down = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      const isCtrlK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
      // Check for Ctrl+Shift+K or Cmd+Shift+K
      const isCtrlShiftK = isCtrlK && e.shiftKey;

      if (isCtrlK || isCtrlShiftK) {
        e.preventDefault();
        e.stopPropagation();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', down, { capture: true });
    return () => window.removeEventListener('keydown', down, { capture: true });
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    router.push('/auth/login');
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4 gap-4 shrink-0">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <Button
          variant="outline"
          className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
          onClick={() => setSearchOpen(true)}
        >
          <span className="hidden lg:inline-flex">Search documentation...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⇧⌘K</span>
          </kbd>
        </Button>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        {mounted && (
          <NotificationDropdown 
            notifications={notifications}
            onMarkAllAsRead={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}
            onMarkAsRead={(id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))}
            onDelete={(id) => setNotifications(n => n.filter(x => x.id !== id))}
          />
        )}

        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            id="dashboard-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {user ? getInitials(user.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">
                {user?.full_name?.split(' ')[0] || 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={handleLogout}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
