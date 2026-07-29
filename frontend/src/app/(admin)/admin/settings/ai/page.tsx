'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { SystemSetting } from '@/types/admin';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AISettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.data.ai) {
        setSettings(res.data.ai);
        const initial: Record<string, any> = {};
        res.data.ai.forEach((s: SystemSetting) => {
          if (!s.read_only) {
            initial[s.key] = s.value;
          }
        });
        setFormValues(initial);
        setOriginalValues(initial);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load AI settings');
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
      const updates = Object.keys(formValues)
        .filter(key => formValues[key] !== originalValues[key])
        .map(key => {
           let val = formValues[key];
           // Convert back to numbers if it was a number originally (simple check)
           if (typeof originalValues[key] === 'number') {
             val = Number(val);
           }
           return { key, value: val };
        });
        
      if (updates.length === 0) {
        toast.info('No changes to save');
        setIsSaving(false);
        return;
      }

      const res = await adminApi.updateSettings(updates);
      if (res.success) {
        toast.success('AI settings updated successfully');
        setOriginalValues(formValues);
      } else {
        toast.error('Failed to update settings');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving AI settings');
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

  const editableSettings = settings.filter(s => !s.read_only);
  const readonlySettings = settings.filter(s => s.read_only);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">AI Thresholds & Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">Configure scoring thresholds and default models.</p>
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
          {editableSettings.map((setting) => (
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
                  type={typeof originalValues[setting.key] === 'number' ? 'number' : 'text'}
                  step={typeof originalValues[setting.key] === 'number' ? '0.1' : undefined}
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

      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Provider Credentials (Read-Only)</h2>
          <p className="text-sm text-gray-500 mt-1">These settings are loaded from your secure environment variables and cannot be edited here.</p>
        </div>
        
        <div className="p-6 space-y-6">
          {readonlySettings.map((setting) => (
            <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6 last:border-0 dark:border-gray-700">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {setting.key}
                </label>
                {setting.description && (
                  <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                )}
              </div>
              <div className="md:col-span-2 flex items-center">
                {setting.is_secret ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded border">
                    {setting.value !== 'Not Configured' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-mono tracking-widest text-gray-600 dark:text-gray-400">••••••••</span>
                        <span className="text-xs text-green-600 font-medium ml-2">Configured</span>
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
    </div>
  );
}
