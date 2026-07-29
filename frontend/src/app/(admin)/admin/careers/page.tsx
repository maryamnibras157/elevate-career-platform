'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { AdminCareer, PaginatedResponse } from '@/types/admin';
import { useAdminStore } from '@/store/adminStore';
import { Search, Loader2, Filter, X, Briefcase, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCareersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasPermission } = useAdminStore();
  const canCreate = hasPermission('CREATE_CAREERS');

  // URL state sync
  const page = Number(searchParams.get('page')) || 1;
  const size = Number(searchParams.get('size')) || 20;
  const search = searchParams.get('search') || '';
  const demandLevelFilter = searchParams.get('demand_level');

  // Count active filters for indicator
  const activeFiltersCount = (demandLevelFilter ? 1 : 0) + (search ? 1 : 0);

  const [careersData, setCareersData] = useState<PaginatedResponse<AdminCareer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  const fetchCareers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, size };
      if (search) params.search = search;
      if (demandLevelFilter) params.demand_level = demandLevelFilter;

      const res = await adminApi.getCareers(params);
      if (res.success) {
        setCareersData(res.data);
      } else {
        toast.error('Failed to fetch careers');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while fetching careers');
    } finally {
      setIsLoading(false);
    }
  }, [page, size, search, demandLevelFilter]);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  // Debounce search
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

  const clearFilters = () => {
    router.push(pathname);
    setSearchInput('');
  };

  return (
    <PageShell
      title="Career Management"
      description="Manage career paths and recommendations."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Careers' }
      ]}
      actions={
        canCreate && (
          <Link
            href="/admin/careers/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Career</span>
          </Link>
        )
      }
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search careers by title or description..."
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            className="border rounded-md px-3 py-2 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={demandLevelFilter || ''}
            onChange={(e) => updateQueryParams({ demand_level: e.target.value || null, page: 1 })}
          >
            <option value="">All Demand Levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <X className="h-4 w-4 mr-1" /> Clear ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Demand Level</th>
                <th className="px-6 py-4">Salary Estimate</th>
                <th className="px-6 py-4">Growth Outlook</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {isLoading && !careersData ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full shrink-0" /><Skeleton className="h-4 w-40" /></div></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : careersData?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-0 py-0">
                    <EmptyState
                      icon={Filter}
                      title="No careers found"
                      description="Try adjusting your filters or search query."
                    />
                  </td>
                </tr>
              ) : (
                careersData?.items.map((career) => (
                  <tr key={career.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden shrink-0">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{career.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {career.demand_level ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          career.demand_level.toLowerCase() === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          career.demand_level.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {career.demand_level}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {career.salary_estimate || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 line-clamp-2">
                      {career.growth_outlook || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(career.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/careers/${career.id}`}
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
        {careersData && careersData.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-gray-900/50">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(page - 1) * size + 1}</span> to <span className="font-medium">{Math.min(page * size, careersData.total)}</span> of <span className="font-medium">{careersData.total}</span> careers
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
                  Page {page} of {careersData.pages || 1}
                </span>
                <button
                  disabled={page >= (careersData.pages || 1)}
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
    </PageShell>
  );
}
