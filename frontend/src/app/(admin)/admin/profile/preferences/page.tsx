'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { AdminPreferencesUpdate } from '@/types/admin';
import { Loader2, Save, Moon, Globe, Bell, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<AdminPreferencesUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getMyPreferences();
      if (res.success && res.data) {
        setPrefs(res.data);
      }
    } catch (e) {
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prefs) return;
    setIsSaving(true);
    try {
      const res = await adminApi.updateMyPreferences(prefs);
      if (res.success) {
        toast.success('Preferences saved successfully');
      }
    } catch (e) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!prefs) return <div>Failed to load</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
        
        {/* Appearance */}
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium mb-1">Appearance & Locale</h3>
          <p className="text-sm text-gray-500 mb-6">Customize how the admin dashboard looks and feels.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Moon className="h-4 w-4 text-indigo-500" /> Theme</label>
              <select 
                value={prefs.theme} 
                onChange={(e) => setPrefs({...prefs, theme: e.target.value})} 
                className="w-full h-10 px-3 rounded-md border bg-transparent"
              >
                <option value="system">System Default</option>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4 text-blue-500" /> Language</label>
              <select 
                value={prefs.language} 
                onChange={(e) => setPrefs({...prefs, language: e.target.value})} 
                className="w-full h-10 px-3 rounded-md border bg-transparent"
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium mb-1">Notification Preferences</h3>
          <p className="text-sm text-gray-500 mb-6">Control when and how you receive administrative alerts.</p>
          
          <div className="space-y-6 max-w-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium flex items-center gap-2"><Bell className="h-4 w-4 text-amber-500" /> In-App Notifications</label>
                <p className="text-xs text-gray-500">Receive alerts inside the admin panel.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={prefs.notifications_enabled} 
                  onChange={(e) => setPrefs({...prefs, notifications_enabled: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-green-500" /> Email Notifications</label>
                <p className="text-xs text-gray-500">Receive critical system alerts via email.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={prefs.email_notifications} 
                  onChange={(e) => setPrefs({...prefs, email_notifications: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
