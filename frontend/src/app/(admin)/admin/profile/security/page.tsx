'use client';

import { useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { Loader2, KeyRound, ShieldAlert, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.match(/[A-Z]/)) score++;
    if (pass.match(/[0-9]/)) score++;
    if (pass.match(/[^A-Za-z0-9]/)) score++;
    return score;
  };

  const strength = calculateStrength(newPassword);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) return toast.error('Current password is required');
    if (newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setIsSaving(true);
    try {
      const res = await adminApi.changeMyPassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.success) {
        toast.success(res.data?.message || 'Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2"><KeyRound className="h-5 w-5 text-blue-500" /> Change Password</h3>
          <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Current Password</label>
            <Input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              required
            />
          </div>
          
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-medium">New Password</label>
            <Input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required
            />
            {newPassword.length > 0 && (
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-full rounded-full transition-colors ${
                      strength >= i ? (strength > 2 ? 'bg-green-500' : 'bg-amber-500') : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
            />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isSaving || !currentPassword || !newPassword}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Password
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-indigo-500" /> Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 mt-1">Add additional security to your account using two-factor authentication.</p>
        </div>

        <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Not Configured</p>
            <p className="text-xs text-gray-500">2FA enrollment is currently managed by system administrators.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
