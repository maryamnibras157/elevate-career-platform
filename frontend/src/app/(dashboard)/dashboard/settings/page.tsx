'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { UserPreferences } from '@/types/user.types';
import { toast } from 'sonner';
import { Moon, Sun, Monitor, Bell, Shield, Eye, Laptop } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    userService
      .getPreferences()
      .then(setPrefs)
      .catch(() => {
        // Offline — preferences unavailable; keep defaults shown
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: keyof UserPreferences, value: boolean) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      await userService.updatePreferences({ [key]: value });
      toast.success('Preference saved.');
    } catch {
      // Revert on failure
      setPrefs(prefs);
      toast.error('Failed to save preference. Please try again.');
    }
  };

  const notificationItems = [
    {
      label: 'Email notifications',
      desc: 'Receive updates and insights via email',
      id: 'email-notif',
      prefKey: 'email_notifications' as keyof UserPreferences,
      value: prefs?.email_notifications ?? true,
    },
    {
      label: 'All notifications',
      desc: 'Master switch for all in-app notifications',
      id: 'all-notif',
      prefKey: 'notifications_enabled' as keyof UserPreferences,
      value: prefs?.notifications_enabled ?? true,
    },
  ];

  const handleDeleteAccount = () => {
    toast.success('Account deletion request submitted.');
  }

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of ELEVATE.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">Select your preferred theme.</p>
              </div>
              <div className="flex bg-muted p-1 rounded-md">
                <Button variant={theme === 'light' ? 'primary' : 'ghost'} size="sm" onClick={() => setTheme('light')} className="h-7 px-2">
                  <Sun className="h-4 w-4 mr-1" /> Light
                </Button>
                <Button variant={theme === 'dark' ? 'primary' : 'ghost'} size="sm" onClick={() => setTheme('dark')} className="h-7 px-2">
                  <Moon className="h-4 w-4 mr-1" /> Dark
                </Button>
                <Button variant={theme === 'system' ? 'primary' : 'ghost'} size="sm" onClick={() => setTheme('system')} className="h-7 px-2">
                  <Monitor className="h-4 w-4 mr-1" /> System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationItems.map((item, index, arr) => (
              <div key={item.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={item.value}
                    disabled={loading}
                    onCheckedChange={(checked) => handleToggle(item.prefKey, checked)}
                  />
                </div>
                {index < arr.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>Manage your data visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Public Profile</p>
                <p className="text-xs text-muted-foreground mt-0.5">Allow others to see your profile.</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Analytics Sharing</p>
                <p className="text-xs text-muted-foreground mt-0.5">Share anonymous usage data to improve ELEVATE.</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Keep your account safe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground mt-0.5">Last changed 3 months ago.</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Delete account</p>
                <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all data.</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)}>Delete account</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
        confirmText="Delete Account"
        onConfirm={handleDeleteAccount}
        variant="danger"
      />
    </div>
  );
}
