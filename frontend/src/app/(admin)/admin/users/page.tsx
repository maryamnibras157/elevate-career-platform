'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { User, PaginatedResponse } from '@/types/admin';
import { useAdminStore } from '@/store/adminStore';
import { Search, Loader2, Filter, MoreVertical, X, ShieldAlert, CheckCircle2, User as UserIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasPermission } = useAdminStore();
  const canUpdate = hasPermission('UPDATE_USERS');

  // URL state sync
  const page = Number(searchParams.get('page')) || 1;
  const size = Number(searchParams.get('size')) || 20;
  const search = searchParams.get('search') || '';
  const isActiveFilter = searchParams.get('is_active');
  const roleFilter = searchParams.get('role');
  const isVerifiedFilter = searchParams.get('is_verified');
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';

  // Count active filters for indicator
  const activeFiltersCount = (isActiveFilter ? 1 : 0) + (roleFilter ? 1 : 0) + (isVerifiedFilter ? 1 : 0) + (search ? 1 : 0);

  const [usersData, setUsersData] = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, size, sort_by: sortBy, sort_order: sortOrder };
      if (search) params.search = search;
      if (isActiveFilter !== null) params.is_active = isActiveFilter === 'true';
      if (roleFilter) params.role = roleFilter;
      if (isVerifiedFilter !== null) params.is_verified = isVerifiedFilter === 'true';

      const res = await adminApi.getUsers(params);
      if (res.success) {
        setUsersData(res.data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  }, [page, size, search, isActiveFilter, roleFilter, isVerifiedFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handleSort = (field: string) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    updateQueryParams({ sort_by: field, sort_order: isAsc ? 'desc' : 'asc', page: 1 });
  };

  const clearFilters = () => {
    router.push(pathname);
    setSearchInput('');
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1 text-primary" /> : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  return (
    <PageShell 
      title="User Management" 
      description="Manage user accounts and permissions."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Users' }
      ]}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            className="border rounded-md px-3 py-2 bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
            value={isActiveFilter || ''}
            onChange={(e) => updateQueryParams({ is_active: e.target.value || null, page: 1 })}
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            className="border rounded-md px-3 py-2 bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
            value={roleFilter || ''}
            onChange={(e) => updateQueryParams({ role: e.target.value || null, page: 1 })}
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <select
            className="border rounded-md px-3 py-2 bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
            value={isVerifiedFilter || ''}
            onChange={(e) => updateQueryParams({ is_verified: e.target.value || null, page: 1 })}
          >
            <option value="">Verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center"
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
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('full_name')}>
                  <div className="flex items-center">User {renderSortIcon('full_name')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('role')}>
                  <div className="flex items-center">Role {renderSortIcon('role')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('is_active')}>
                  <div className="flex items-center">Status {renderSortIcon('is_active')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center">Created Date {renderSortIcon('created_at')}</div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !usersData ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : usersData?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-0 py-0">
                    <EmptyState
                      icon={Filter}
                      title="No users found"
                      description="Try adjusting your filters or search query."
                    />
                  </td>
                </tr>
              ) : (
                usersData?.items.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden shrink-0">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{user.full_name}</div>
                          <div className="text-gray-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.is_active ? (
                          <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 dark:text-red-400 text-xs font-medium">
                            <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Inactive
                          </span>
                        )}
                        {!user.is_verified && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded ml-2">Unverified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/users/${user.id}`}
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
        {usersData && usersData.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-gray-900/50">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(page - 1) * size + 1}</span> to <span className="font-medium">{Math.min(page * size, usersData.total)}</span> of <span className="font-medium">{usersData.total}</span> users
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
                  Page {page} of {usersData.pages || 1}
                </span>
                <button
                  disabled={page >= (usersData.pages || 1)}
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
