'use client';

import { Clock } from 'lucide-react';

export function DashboardRecentActivity() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-gray-500">Latest administrative actions.</p>
      </div>
      
      {/* Empty State per requirements since there is no backend for this yet */}
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-3">
          <Clock className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100">No recent activity</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          There are no administrative actions recorded in the specified period.
        </p>
      </div>
    </div>
  );
}
