'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { AdminResumeStatisticsOut, AdminResumeAnalysis, PaginatedResponse } from '@/types/admin';
import { useAdminStore } from '@/store/adminStore';
import { Search, Loader2, Filter, X, FileText, BarChart3, TrendingUp, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageShell } from '@/components/layout/PageShell';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF2', '#F781BF'];

export default function ResumeStatisticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasPermission } = useAdminStore();

  const page = Number(searchParams.get('page')) || 1;
  const size = Number(searchParams.get('size')) || 20;
  const search = searchParams.get('search') || '';
  const minResumeScore = searchParams.get('min_resume_score');
  const minAtsScore = searchParams.get('min_ats_score');

  const activeFiltersCount = (search ? 1 : 0) + (minResumeScore ? 1 : 0) + (minAtsScore ? 1 : 0);

  const [stats, setStats] = useState<AdminResumeStatisticsOut | null>(null);
  const [analyses, setAnalyses] = useState<PaginatedResponse<AdminResumeAnalysis> | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getResumeStatistics();
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load resume statistics');
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const fetchAnalyses = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      const params: any = { page, size };
      if (search) params.search = search;
      if (minResumeScore) params.min_resume_score = Number(minResumeScore);
      if (minAtsScore) params.min_ats_score = Number(minAtsScore);

      const res = await adminApi.getResumeAnalyses(params);
      if (res.success) {
        setAnalyses(res.data);
      } else {
        toast.error('Failed to fetch resume analyses');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while fetching analyses');
    } finally {
      setIsLoadingTable(false);
    }
  }, [page, size, search, minResumeScore, minAtsScore]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        updateQueryParams({ search: searchInput || null, page: 1 });
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const updateQueryParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
    setSearchInput('');
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (minResumeScore) params.min_resume_score = Number(minResumeScore);
      if (minAtsScore) params.min_ats_score = Number(minAtsScore);
      await adminApi.exportResumeStatisticsCsv(params);
      toast.success('CSV Export successful');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageShell
      title="Resume Statistics"
      description="Overview of all resume analyses, charts, and ATS scoring."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Resume Stats' }
      ]}
      actions={
        <Button 
          variant="outline" 
          onClick={handleExportCsv} 
          disabled={isExporting}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Analyses</h3>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline text-3xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? <Skeleton className="h-8 w-20" /> : stats?.total_uploads || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Successful Parses</h3>
              <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline text-3xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? <Skeleton className="h-8 w-20" /> : stats?.successful_parses || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Avg Resume Score</h3>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30 dark:text-purple-400">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline text-3xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? <Skeleton className="h-8 w-20" /> : `${stats?.average_resume_score?.toFixed(1) || 0}%`}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Avg ATS Score</h3>
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline text-3xl font-bold text-gray-900 dark:text-white">
              {isLoadingStats ? <Skeleton className="h-8 w-20" /> : `${stats?.average_ats_score?.toFixed(1) || 0}%`}
            </div>
          </div>
        </div>

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Resume Score Distribution</h3>
              <div className="h-[300px]">
                {stats.resume_score_distribution && stats.resume_score_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.resume_score_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recommendation Categories</h3>
              <div className="h-[300px]">
                {stats.recommendation_categories && stats.recommendation_categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.recommendation_categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="category"
                        label={({ name, percent }) => `${name.substring(0, 10)}... (${(percent * 100).toFixed(0)}%)`}
                      >
                        {stats.recommendation_categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user name or email..."
                className="w-full pl-9 pr-4 py-2 border rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select
                className="border rounded-md px-3 py-2 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={minResumeScore || ''}
                onChange={(e) => updateQueryParams({ min_resume_score: e.target.value || null, page: 1 })}
              >
                <option value="">All Resume Scores</option>
                <option value="90">90+ Score</option>
                <option value="80">80+ Score</option>
                <option value="70">70+ Score</option>
                <option value="50">50+ Score</option>
              </select>

              <select
                className="border rounded-md px-3 py-2 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={minAtsScore || ''}
                onChange={(e) => updateQueryParams({ min_ats_score: e.target.value || null, page: 1 })}
              >
                <option value="">All ATS Scores</option>
                <option value="90">90+ Score</option>
                <option value="80">80+ Score</option>
                <option value="70">70+ Score</option>
                <option value="50">50+ Score</option>
              </select>
            </div>
          </div>

          {/* Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t dark:border-gray-700">
              <span className="text-sm text-gray-500 flex items-center">
                <Filter className="h-3 w-3 mr-1" /> {activeFiltersCount} Active Filters:
              </span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  Search: {search}
                  <button onClick={() => { setSearchInput(''); updateQueryParams({ search: null, page: 1 }); }} className="hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"><X className="h-3 w-3" /></button>
                </span>
              )}
              {minResumeScore && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  Resume Score ≥ {minResumeScore}
                  <button onClick={() => updateQueryParams({ min_resume_score: null, page: 1 })} className="hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"><X className="h-3 w-3" /></button>
                </span>
              )}
              {minAtsScore && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  ATS Score ≥ {minAtsScore}
                  <button onClick={() => updateQueryParams({ min_ats_score: null, page: 1 })} className="hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"><X className="h-3 w-3" /></button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Resume Score</th>
                  <th className="px-6 py-4">ATS Score</th>
                  <th className="px-6 py-4">Skills Extracted</th>
                  <th className="px-6 py-4">Analyzed Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {isLoadingTable && !analyses ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : analyses?.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-0 py-0">
                      <EmptyState
                        icon={Filter}
                        title="No analyses found"
                        description="Try adjusting your filters or search query."
                      />
                    </td>
                  </tr>
                ) : (
                  analyses?.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.user_name || 'Unknown User'}</div>
                          <div className="text-gray-500 text-xs">{item.user_email || 'No email'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.resume_score ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.resume_score >= 80 ? 'bg-green-500' : item.resume_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${item.resume_score}%` }}
                              />
                            </div>
                            <span className="font-medium text-xs">{item.resume_score.toFixed(0)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.ats_score ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.ats_score >= 80 ? 'bg-green-500' : item.ats_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${item.ats_score}%` }}
                              />
                            </div>
                            <span className="font-medium text-xs">{item.ats_score.toFixed(0)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.skills?.length || 0} skills
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/resume-statistics/${item.id}`}
                          className="text-sm font-medium text-primary hover:underline px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {analyses && analyses.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-gray-900/50">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(page - 1) * size + 1}</span> to <span className="font-medium">{Math.min(page * size, analyses.total)}</span> of <span className="font-medium">{analyses.total}</span> analyses
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={size}
                  onChange={(e) => updateQueryParams({ size: Number(e.target.value), page: 1 })}
                  aria-label="Items per page"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
                
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateQueryParams({ page: page - 1 })}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {page} of {analyses.pages || 1}
                  </span>
                  <button
                    disabled={page >= (analyses.pages || 1)}
                    onClick={() => updateQueryParams({ page: page + 1 })}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
