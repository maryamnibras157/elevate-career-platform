'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { SystemSetting } from '@/types/admin';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.data.email) {
        setSettings(res.data.email);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load email settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
      <div className="p-6 border-b dark:border-gray-700 flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Email Configuration (Read-Only)</h2>
          <p className="text-sm text-gray-500 mt-1">SMTP settings loaded from the environment variables.</p>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {settings.map((setting) => (
          <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6 last:border-0 dark:border-gray-700">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {setting.description || setting.key}
              </label>
              <p className="text-xs text-gray-500 mt-1 font-mono">{setting.key}</p>
            </div>
            <div className="md:col-span-2 flex items-center">
              {setting.is_secret ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded border">
                  {setting.value !== 'Not Configured' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-mono tracking-widest text-gray-600 dark:text-gray-400">••••••••</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 font-medium">Not Configured</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded border font-mono text-sm">
                  {setting.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
