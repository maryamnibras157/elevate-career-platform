'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/services/adminApi';
import { Notification, NotificationStatisticsOut, NotificationFilterParams } from '@/types/admin';
import { 
  Loader2, Search, Download, ChevronDown, 
  ChevronUp, ChevronLeft, ChevronRight, Activity, Plus, FileText, Send, Calendar, Archive, Trash2, Edit, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { PageShell } from '@/components/layout/PageShell';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function NotificationsPage() {
  const [logs, setLogs] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStatisticsOut | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDesc, setSortDesc] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getNotificationStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: NotificationFilterParams = {
        page,
        page_size: pageSize,
        search: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        sort_by: sortBy,
        sort_desc: sortDesc
      };
      const res = await adminApi.getNotifications(params);
      if (res.success && res.data) {
        setLogs(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearchTerm, statusFilter, typeFilter, sortBy, sortDesc]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      await adminApi.deleteNotification(id);
      toast.success('Notification deleted');
      fetchLogs();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const activeFiltersCount = (debouncedSearchTerm ? 1 : 0) + (statusFilter ? 1 : 0) + (typeFilter ? 1 : 0);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <PageShell
      title="Announcements"
      description="Broadcast, schedule, and track platform-wide notifications."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Announcements' }
      ]}
      actions={
        <Link href="/admin/notifications/new">
          <Button className="bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create Announcement</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Total</p><h3 className="text-2xl font-bold mt-1">{stats.total_notifications}</h3></div>
              <div className="h-10 w-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center dark:bg-gray-900 dark:text-gray-400"><FileText className="h-5 w-5" /></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Active</p><h3 className="text-2xl font-bold mt-1">{stats.active_notifications}</h3></div>
              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center dark:bg-green-900/30 dark:text-green-400"><Send className="h-5 w-5" /></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Scheduled</p><h3 className="text-2xl font-bold mt-1">{stats.scheduled_notifications}</h3></div>
              <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center dark:bg-indigo-900/30 dark:text-indigo-400"><Calendar className="h-5 w-5" /></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Drafts</p><h3 className="text-2xl font-bold mt-1">{stats.draft_notifications}</h3></div>
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400"><Edit className="h-5 w-5" /></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Expired/Archived</p><h3 className="text-2xl font-bold mt-1">{stats.expired_notifications}</h3></div>
              <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center dark:bg-amber-900/30 dark:text-amber-400"><Archive className="h-5 w-5" /></div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search title or message..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9 w-full bg-white dark:bg-gray-800 focus-visible:ring-primary" />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="text-sm rounded-md border px-3 py-2 bg-white dark:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
              {activeFiltersCount > 0 && <Button variant="ghost" size="sm" onClick={clearFilters} className="focus-visible:ring-primary">Clear ({activeFiltersCount})</Button>}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('title')}>
                    <div className="flex items-center">Title {sortBy === 'title' && (sortDesc ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />)}</div>
                  </th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Audience</th>
                  <th className="px-6 py-4 font-medium">Published / Scheduled</th>
                  <th className="px-6 py-4 font-medium">Read Rate</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-2 w-16 rounded-full" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2"><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-0 py-0">
                      <EmptyState
                        icon={Filter}
                        title="No notifications found"
                        description="Try adjusting your filters or search query."
                      />
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <Link href={`/admin/notifications/${log.id}`} className="hover:underline text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">{log.title}</Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          log.status === 'Published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          log.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{log.target_audience}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(log.published_at || log.scheduled_at)}</td>
                      <td className="px-6 py-4">
                        {log.status === 'Published' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{width: `${log.read_percentage}%`}}></div>
                            </div>
                            <span className="text-xs">{log.read_percentage}%</span>
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Link href={`/admin/notifications/${log.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Edit" disabled={log.status === 'Published'} className="focus-visible:ring-primary"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(log.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && logs.length > 0 && (
            <div className="p-4 border-t flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} results
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="focus-visible:ring-primary"><ChevronLeft className="h-4 w-4" /> Prev</Button>
                <div className="px-3 text-sm font-medium">{page} / {totalPages || 1}</div>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="focus-visible:ring-primary">Next <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
