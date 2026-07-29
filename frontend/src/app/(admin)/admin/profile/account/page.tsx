'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { Loader2, Save, Upload, User as UserIcon, Github, Chrome, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AccountProfilePage() {
  const [account, setAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getMyAccount();
      if (res.success && res.data) {
        setAccount(res.data);
        setFullName(res.data.full_name);
      }
    } catch (e) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) return toast.error('Name cannot be empty');
    
    setIsSaving(true);
    try {
      const res = await adminApi.updateMyAccount({ full_name: fullName });
      if (res.success) {
        toast.success(res.data?.message || 'Profile updated');
        // Refresh local context
        setAccount({ ...account, full_name: fullName });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to update profile');
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

  if (!account) return <div>Failed to load</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 space-y-8">
        
        {/* Avatar Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <UserIcon className="h-10 w-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <Button variant="outline" disabled title="Uploads currently disabled">
                <Upload className="h-4 w-4 mr-2" /> Upload new picture
              </Button>
              <p className="text-xs text-gray-500">
                Avatar uploads are temporarily unavailable in this version.
              </p>
            </div>
          </div>
        </div>

        <hr className="dark:border-gray-700" />

        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  value={account.email} 
                  disabled 
                  className="pl-9 bg-gray-50 dark:bg-gray-900 cursor-not-allowed" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email addresses cannot be changed directly to protect account security.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-500 block">Role</label>
                <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {account.role.toUpperCase()}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block">Status</label>
                <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${account.is_verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {account.is_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={isSaving || fullName === account.full_name}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-medium mb-1">Connected Accounts</h3>
        <p className="text-sm text-gray-500 mb-6">Linked OAuth providers for single sign-on.</p>
        
        <div className="space-y-4 max-w-md">
          {account.is_oauth ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                {account.oauth_provider === 'google' ? <Chrome className="h-5 w-5 text-red-500" /> : <Github className="h-5 w-5" />}
                <div>
                  <p className="text-sm font-medium capitalize">{account.oauth_provider}</p>
                  <p className="text-xs text-gray-500">Connected</p>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 border border-dashed rounded-lg text-gray-500 text-sm">
              No accounts connected. You log in using a password.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
