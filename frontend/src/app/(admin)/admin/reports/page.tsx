'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/services/adminApi';
import { ReportConfigOut, ReportHistoryOut, ReportFilterParams } from '@/types/admin';
import { 
  Loader2, Search, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, 
  FileText, Calendar, Archive, Trash2, LayoutDashboard, History, Settings2, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
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

export default function ReportsDashboardPage() {
  const [activeTab, setActiveTab] = useState<'configs' | 'history'>('configs');
  
  const [configs, setConfigs] = useState<ReportConfigOut[]>([]);
  const [history, setHistory] = useState<ReportHistoryOut[]>([]);
  
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDesc, setSortDesc] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ReportFilterParams = {
        page,
        page_size: pageSize,
        search: debouncedSearchTerm || undefined,
        category: categoryFilter || undefined,
        sort_by: sortBy,
        sort_desc: sortDesc
      };
      
      if (activeTab === 'configs') {
        const res = await adminApi.getReportConfigs(params);
        if (res.success && res.data) {
          setConfigs(res.data.items);
          setTotal(res.data.total);
        }
      } else {
        params.sort_by = sortBy === 'created_at' ? 'generated_at' : sortBy;
        const res = await adminApi.getReportHistory(params);
        if (res.success && res.data) {
          setHistory(res.data.items);
          setTotal(res.data.total);
        }
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearchTerm, categoryFilter, sortBy, sortDesc, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
    setPage(1);
  };
  
  const handleTabSwitch = (tab: 'configs' | 'history') => {
    setActiveTab(tab);
    setPage(1);
    setSortBy(tab === 'configs' ? 'created_at' : 'generated_at');
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Delete this report configuration?')) return;
    try {
      await adminApi.deleteReportConfig(id);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };
  
  const handleDownload = async (configId: string) => {
    try {
      const blob = await adminApi.downloadConfiguredReport(configId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${configId}.csv`;
      a.click();
      toast.success('Report downloaded successfully');
    } catch {
      toast.error('Failed to download report');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <PageShell
      title="Reports & Data Exports"
      description="Configure custom reports, view histories, and download platform data securely."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Reports' }
      ]}
      actions={
        <div className="flex gap-2">
          <Link href="/admin/reports/executive">
            <Button variant="outline" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Executive Dashboard</span>
            </Button>
          </Link>
          <Link href="/admin/reports/new">
            <Button className="bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Build Report</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b px-4 flex gap-6">
          <button 
            className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeTab === 'configs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabSwitch('configs')}
          >
            <Settings2 className="h-4 w-4" /> Configured Reports
          </button>
          <button 
            className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabSwitch('history')}
          >
            <History className="h-4 w-4" /> Generation History
          </button>
        </div>
        
        <div className="p-4 border-b dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search reports..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9 w-full bg-white dark:bg-gray-800 focus-visible:ring-primary" />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="text-sm rounded-md border px-3 py-2 bg-white dark:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="">All Categories</option>
              <option value="Users">Users</option>
              <option value="Careers">Careers</option>
              <option value="Resumes">Resumes</option>
              <option value="Audit Logs">Audit Logs</option>
              <option value="Notifications">Notifications</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'configs' ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center">Name {sortBy === 'name' && (sortDesc ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />)}</div>
                  </th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Format</th>
                  <th className="px-6 py-4 font-medium">Schedule</th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center">Created At {sortBy === 'created_at' && (sortDesc ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />)}</div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : configs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-0 py-0">
                      <EmptyState
                        icon={Filter}
                        title="No report configs found"
                        description="Try adjusting your filters or build a new report."
                      />
                    </td>
                  </tr>
                ) : (
                  configs.map((conf) => (
                    <tr key={conf.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium"><Link href={`/admin/reports/${conf.id}`} className="hover:underline text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">{conf.name}</Link></td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{conf.category}</span></td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{conf.format}</td>
                      <td className="px-6 py-4">{conf.schedule ? <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400"><Calendar className="h-3 w-3" /> {conf.schedule.frequency}</span> : <span className="text-gray-400">None</span>}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(conf.created_at)}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Generate Now" onClick={() => handleDownload(conf.id)} className="focus-visible:ring-primary"><Download className="h-4 w-4 text-green-600" /></Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDeleteConfig(conf.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Report Config</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('generated_at')}>
                    <div className="flex items-center">Generated At {sortBy === 'generated_at' && (sortDesc ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />)}</div>
                  </th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Records</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-0 py-0">
                      <EmptyState
                        icon={History}
                        title="No generation history found"
                        description="Try adjusting your filters or wait for a report to generate."
                      />
                    </td>
                  </tr>
                ) : (
                  history.map((hist) => (
                    <tr key={hist.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium"><Link href={`/admin/reports/${hist.report_config_id}`} className="hover:underline text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">{hist.config_name}</Link></td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{hist.config_category}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(hist.generated_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${hist.status === 'SUCCESS' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {hist.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{hist.record_count.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(hist.report_config_id)} disabled={hist.status !== 'SUCCESS'} className="focus-visible:ring-primary">
                          <Download className="mr-2 h-4 w-4" /> Regenerate
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
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
    </PageShell>
  );
}
