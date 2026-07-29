'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { User, UserActivity } from '@/types/admin';
import { useAdminStore } from '@/store/adminStore';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ArrowLeft, User as UserIcon, CheckCircle2, ShieldAlert, Mail, Calendar, Copy, MoreVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminUserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  
  const { hasPermission, adminContext } = useAdminStore();
  const canUpdate = hasPermission('UPDATE_USERS');
  const canDelete = hasPermission('DELETE_USERS');
  
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userRes, activityRes] = await Promise.allSettled([
        adminApi.getUserById(userId),
        adminApi.getUserActivity(userId)
      ]);
      
      if (userRes.status === 'fulfilled' && userRes.value.success) {
        setUser(userRes.value.data);
      } else {
        toast.error('Failed to fetch user details');
        router.push('/admin/users');
      }

      if (activityRes.status === 'fulfilled' && activityRes.value.success) {
        setActivity(activityRes.value.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('User not found');
      router.push('/admin/users');
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const handleActivate = async () => {
    setIsActionLoading(true);
    try {
      const res = await adminApi.activateUser(userId);
      if (res.success) {
        toast.success('User activated successfully');
        fetchUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to activate user');
    } finally {
      setIsActionLoading(false);
      setIsActivateDialogOpen(false);
    }
  };

  const handleDeactivate = async () => {
    setIsActionLoading(true);
    try {
      const res = await adminApi.deactivateUser(userId);
      if (res.success) {
        toast.success('User deactivated successfully');
        fetchUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to deactivate user');
    } finally {
      setIsActionLoading(false);
      setIsDeactivateDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      const res = await adminApi.deleteUser(userId);
      if (res.success) {
        toast.success('User deleted successfully');
        router.push('/admin/users');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
      setIsActionLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (!user) return null;

  const isSelf = adminContext?.user_id === user.id;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Link 
        href="/admin/users"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b"></div>
        
        {/* Profile Info */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-800 p-1 shadow-sm border">
              <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                <UserIcon className="h-10 w-10" />
              </div>
            </div>
            
            <div className="flex gap-2">
              {canUpdate && user.is_active && (
                <button
                  onClick={() => setIsDeactivateDialogOpen(true)}
                  disabled={isSelf}
                  className="px-4 py-2 border rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Deactivate
                </button>
              )}
              {canUpdate && !user.is_active && (
                <button
                  onClick={() => setIsActivateDialogOpen(true)}
                  className="px-4 py-2 border rounded-md text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 disabled:opacity-50"
                >
                  Activate
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isSelf}
                  className="px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Delete User
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {user.full_name}
              </h1>
              <div className="flex items-center text-gray-500 mt-1 gap-4 text-sm">
                <span className="flex items-center">
                  <Mail className="h-4 w-4 mr-1.5" /> {user.email}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" /> Joined {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {user.role}
              </span>
              
              <span className={`flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                user.is_active 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {user.is_active ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                {user.is_active ? 'Active' : 'Inactive'}
              </span>

              {user.is_verified ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Verified
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Overview Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Profile Overview</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900 dark:text-gray-100">
                  {user.email}
                  <button onClick={() => copyToClipboard(user.email, 'Email')} className="ml-2 text-gray-400 hover:text-gray-600">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900 dark:text-gray-100 truncate">
                  {user.id}
                  <button onClick={() => copyToClipboard(user.id, 'User ID')} className="ml-2 text-gray-400 hover:text-gray-600 shrink-0">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{new Date(user.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Last Active</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Activity Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Activity Summary</h2>
            {activity ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border flex flex-col justify-center items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activity.total_resumes}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Resumes Analyzed</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border flex flex-col justify-center items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activity.total_interviews}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Mock Interviews</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border flex flex-col justify-center items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activity.total_mentor_sessions}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Mentor Chats</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border flex flex-col justify-center items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activity.total_saved_careers}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Saved Careers</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">Failed to load activity metrics.</p>
              </div>
            )}
          </div>
          
          {/* Timeline Section Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Activity Timeline</h2>
            <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 max-w-md">
                Detailed chronological audit events (such as &quot;uploaded resume&quot;, &quot;generated roadmap&quot;) are not tracked in the current database schema. No activity timeline is available.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Security & Access</h2>
            {isSelf && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-400">
                This is your own account. Some administrative actions are disabled to prevent accidental lockouts.
              </div>
            )}
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Role</span>
                <span className="font-medium">{user.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account Status</span>
                <span className={`font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Email Verified</span>
                <span className="font-medium">{user.is_verified ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              Role assignments cannot be modified via the interface at this time. Please contact a system administrator for role escalations.
            </p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmationDialog 
        open={isActivateDialogOpen}
        onOpenChange={setIsActivateDialogOpen}
        title="Activate User"
        description={`Are you sure you want to activate ${user.full_name}? They will regain access to their account.`}
        confirmText="Activate User"
        variant="success"
        isLoading={isActionLoading}
        onConfirm={handleActivate}
      />

      <ConfirmationDialog 
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${user.full_name}? They will immediately lose access to the platform.`}
        confirmText="Deactivate"
        variant="warning"
        isLoading={isActionLoading}
        onConfirm={handleDeactivate}
      />

      <ConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete User"
        description={`This action is permanent and irreversible. Are you sure you want to delete ${user.full_name} and all associated data?`}
        confirmText="Delete Permanently"
        variant="danger"
        isLoading={isActionLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
