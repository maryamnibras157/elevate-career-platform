'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/services/adminApi';
import { AuditLog } from '@/types/admin';
import { Loader2, Activity, ChevronLeft, ChevronRight, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
  }).format(new Date(dateStr));
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [actionFilter, setActionFilter] = useState('');
  const debouncedAction = useDebounce(actionFilter, 500);
  
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getMyActivity({ 
        page, 
        page_size: pageSize,
        action: debouncedAction || undefined,
        sort_by: 'created_at',
        sort_desc: true
      });
      if (res.success && res.data) {
        setLogs(res.data.items);
        setTotal(res.data.total);
      }
    } catch (e) {
      toast.error('Failed to load activity history');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedAction]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2"><Activity className="h-5 w-5 text-green-500" /> Account Activity Log</h3>
        <p className="text-sm text-gray-500 mt-1">Review security events, logins, and profile changes associated with your account.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
        
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Filter by action (e.g. login, profile_updated)..." 
              value={actionFilter} 
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} 
              className="pl-9 w-full" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No activity logs found matching criteria
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4 font-medium">{log.action}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                        log.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded border max-w-xs overflow-x-auto">
                        {JSON.stringify(log.metadata_ || {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && total > 0 && (
          <div className="p-4 border-t flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} events
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="px-3 text-sm font-medium">{page} / {totalPages || 1}</div>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
