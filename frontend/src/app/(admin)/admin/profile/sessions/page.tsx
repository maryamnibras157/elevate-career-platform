'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/services/adminApi';
import { SessionOut } from '@/types/admin';
import { Loader2, MonitorSmartphone, Trash2, ChevronLeft, ChevronRight, Monitor, Smartphone, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionOut[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getMySessions({ page, page_size: pageSize });
      if (res.success && res.data) {
        setSessions(res.data.items);
        setTotal(res.data.total);
      }
    } catch (e) {
      toast.error('Failed to load active sessions');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this session?')) return;
    try {
      await adminApi.terminateMySession(id);
      toast.success('Session terminated');
      fetchSessions();
    } catch {
      toast.error('Failed to terminate session');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!confirm('This will log you out of all other devices. Continue?')) return;
    try {
      const res = await adminApi.terminateAllOtherSessions();
      toast.success(res.data?.message || 'Other sessions terminated');
      fetchSessions();
    } catch {
      toast.error('Failed to terminate other sessions');
    }
  };

  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return <Globe className="h-5 w-5 text-gray-400" />;
    const l = ua.toLowerCase();
    if (l.includes('mobile') || l.includes('android') || l.includes('iphone')) return <Smartphone className="h-5 w-5 text-gray-400" />;
    return <Monitor className="h-5 w-5 text-gray-400" />;
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2"><MonitorSmartphone className="h-5 w-5 text-indigo-500" /> Active Sessions</h3>
          <p className="text-sm text-gray-500 mt-1">Manage devices and browsers currently logged into your account.</p>
        </div>
        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleRevokeAllOther} disabled={sessions.length <= 1}>
          Revoke All Other Sessions
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
        <ul className="divide-y dark:divide-gray-700">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="p-4 animate-pulse flex gap-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </li>
            ))
          ) : sessions.length === 0 ? (
            <li className="p-12 text-center text-gray-500">No active sessions found</li>
          ) : (
            sessions.map(s => (
              <li key={s.id} className="p-4 sm:px-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start gap-4 min-w-0 w-full">
                  <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0 mt-1">
                    {getDeviceIcon(s.user_agent)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate flex items-center gap-2">
                      {s.ip_address || 'Unknown IP'}
                      {s.is_current && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">Current</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{s.user_agent || 'Unknown Device'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Started: {formatDate(s.created_at)}</span>
                    </div>
                  </div>
                </div>
                {!s.is_current && (
                  <Button variant="ghost" size="sm" onClick={() => handleRevoke(s.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0">
                    <Trash2 className="h-4 w-4 mr-2" /> Revoke
                  </Button>
                )}
              </li>
            ))
          )}
        </ul>
        
        {!isLoading && total > 0 && (
          <div className="p-4 border-t flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} sessions
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
