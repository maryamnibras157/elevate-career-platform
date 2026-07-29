'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { adminApi } from '@/services/adminApi';
import { AuditLog, AuditStatisticsOut, AuditFilterParams } from '@/types/admin';
import { 
  Loader2, Search, Filter, Download, ArrowUpDown, ChevronDown, 
  ChevronUp, ChevronLeft, ChevronRight, Activity, AlertCircle, CheckCircle2, Shield, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
};

const formatDateTime = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(dateStr));
};
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { PageShell } from '@/components/layout/PageShell';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const SUCCESS_COLOR = '#10b981';
const FAILED_COLOR = '#ef4444';

export default function AuditLogsPage() {
  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStatisticsOut | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDesc, setSortDesc] = useState(true);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const res = await adminApi.getAuditStatistics();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audit statistics');
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AuditFilterParams = {
        page,
        page_size: pageSize,
        search: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        action: actionFilter || undefined,
        sort_by: sortBy,
        sort_desc: sortDesc
      };
      const res = await adminApi.getAuditLogs(params);
      if (res.success && res.data) {
        setLogs(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearchTerm, statusFilter, actionFilter, sortBy, sortDesc]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Effect for Table updates
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handlers
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
    setActionFilter('');
    setPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params: AuditFilterParams = {
        search: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        action: actionFilter || undefined,
      };
      const blob = await adminApi.exportAuditLogsCsv(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Audit logs exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const activeFiltersCount = (debouncedSearchTerm ? 1 : 0) + (statusFilter ? 1 : 0) + (actionFilter ? 1 : 0);

  return (
    <PageShell
      title="Audit Logs"
      description="Monitor and review administrator actions and system events."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Audit Logs' }
      ]}
      actions={
        <Button onClick={handleExport} disabled={isExporting || logs.length === 0} variant="outline" className="bg-white dark:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      }
    >
      <div className="space-y-8">
        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
                <h3 className="text-2xl font-bold mt-1">{stats.total_events.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center dark:bg-indigo-900/30 dark:text-indigo-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Events Today</p>
                <h3 className="text-2xl font-bold mt-1">{stats.events_today.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful Ops</p>
                <h3 className="text-2xl font-bold mt-1">{stats.successful_operations.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed Ops</p>
                <h3 className="text-2xl font-bold mt-1">{stats.failed_operations.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-medium mb-6">Activity Over Time (30 Days)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.activity_over_time}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(v) => formatDate(v)} stroke="#9ca3af" axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12}} allowDecimals={false} stroke="#9ca3af" axisLine={false} tickLine={false} />
                    <RechartsTooltip labelFormatter={(v) => formatDate(v)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{r: 3}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-medium mb-6">Actions by Category (Top 10)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.actions_by_category}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.actions_by_category.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
          
          {/* Filters */}
          <div className="p-4 border-b dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search action, resource, email..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9 bg-white dark:bg-gray-800 w-full focus-visible:ring-primary"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="text-sm rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
              
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="text-sm rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">All Actions</option>
                <option value="admin_login">Admin Login</option>
                <option value="system_settings_updated">Settings Updated</option>
                <option value="user_deletion">User Deletion</option>
                <option value="career_creation">Career Created</option>
                <option value="unauthorized_access">Unauthorized Access</option>
              </select>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm h-9 focus-visible:ring-primary">
                  Clear ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center">
                      Timestamp
                      {sortBy === 'created_at' && (sortDesc ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium">Administrator</th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('action')}>
                    <div className="flex items-center">
                      Action
                      {sortBy === 'action' && (sortDesc ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium">Resource</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-0 py-0">
                      <EmptyState
                        icon={Shield}
                        title="No audit logs found"
                        description="Try adjusting your filters or search term."
                      />
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{log.user_name || 'System / Unknown'}</div>
                        <div className="text-xs text-gray-500">{log.user_email || log.user_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {log.resource ? (
                          <div className="flex flex-col">
                            <span className="capitalize">{log.resource}</span>
                            {log.resource_id && <span className="text-xs font-mono text-gray-400 truncate max-w-[120px]" title={log.resource_id}>{log.resource_id}</span>}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.status === 'SUCCESS' ? (
                          <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Success
                          </span>
                        ) : log.status === 'FAILED' ? (
                          <span className="flex items-center text-red-600 dark:text-red-400 text-xs font-medium">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" /> Failed
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/audit-logs/${log.id}`}>
                          <Button variant="ghost" size="icon" title="View Details" className="focus-visible:ring-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && logs.length > 0 && (
            <div className="p-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, total)}</span> of <span className="font-medium">{total}</span> results
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={pageSize} 
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="text-sm rounded-md border border-input bg-white dark:bg-gray-800 px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Items per page"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                
                <div className="flex items-center gap-1 ml-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 focus-visible:ring-primary" onClick={() => setPage(1)} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-2" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 focus-visible:ring-primary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 text-sm font-medium">{page} / {totalPages || 1}</div>
                  <Button variant="outline" size="icon" className="h-8 w-8 focus-visible:ring-primary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 focus-visible:ring-primary" onClick={() => setPage(totalPages)} disabled={page === totalPages || totalPages === 0}>
                    <ChevronRight className="h-4 w-4 -mr-2" />
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
