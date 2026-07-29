'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { SystemSetting } from '@/types/admin';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Track modified values locally before saving
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.data.general) {
        setSettings(res.data.general);
        const initial: Record<string, any> = {};
        res.data.general.forEach((s: SystemSetting) => {
          initial[s.key] = s.value;
        });
        setFormValues(initial);
        setOriginalValues(initial);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load general settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = JSON.stringify(formValues) !== JSON.stringify(originalValues);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Find what changed
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
        toast.success('General settings updated successfully');
        setOriginalValues(formValues); // Reset pristine state
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
        No general settings found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
      <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">General Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure global application preferences.</p>
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
          <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6 last:border-0 dark:border-gray-700">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {setting.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </label>
              {setting.description && (
                <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Input
                type="text"
                value={formValues[setting.key] ?? ''}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                disabled={isSaving}
                className="max-w-md"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
