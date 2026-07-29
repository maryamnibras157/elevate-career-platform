'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { SystemSetting } from '@/types/admin';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formValues, setFormValues] = useState<Record<string, boolean>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.data.platform) {
        setSettings(res.data.platform);
        const initial: Record<string, boolean> = {};
        res.data.platform.forEach((s: SystemSetting) => {
          initial[s.key] = Boolean(s.value);
        });
        setFormValues(initial);
        setOriginalValues(initial);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load platform settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: string, checked: boolean) => {
    setFormValues(prev => ({ ...prev, [key]: checked }));
  };

  const hasChanges = JSON.stringify(formValues) !== JSON.stringify(originalValues);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.keys(formValues)
        .filter(key => formValues[key] !== originalValues[key])
        .map(key => ({ key, value: formValues[key] }));
        
      if (updates.length === 0) {
        toast.info('No changes to save');
        setIsSaving(false);
        return;
      }

      const res = await adminApi.updateSettings(updates);
      if (res.success) {
        toast.success('Platform feature flags updated successfully');
        setOriginalValues(formValues);
      } else {
        toast.error('Failed to update settings');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormValues(originalValues);
    toast.info('Changes discarded');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border text-center text-gray-500">
        No platform feature flags found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
      <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Platform & Feature Flags</h2>
          <p className="text-sm text-gray-500 mt-1">Enable or disable specific modules and features across the platform.</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              <RotateCcw className="h-4 w-4 mr-2" /> Discard
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {settings.map((setting) => (
          <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 last:border-0 dark:border-gray-700">
            <div className="flex-1">
              <label className="block text-base font-medium text-gray-900 dark:text-gray-100">
                {setting.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </label>
              {setting.description && (
                <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
              )}
            </div>
            <div>
              <Switch
                checked={formValues[setting.key] || false}
                onCheckedChange={(checked) => handleToggle(setting.key, checked)}
                disabled={isSaving}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
