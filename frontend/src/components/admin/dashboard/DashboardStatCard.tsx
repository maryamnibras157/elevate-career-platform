'use client';

import { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  isLoading: boolean;
  error: boolean;
}

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
  error
}: DashboardStatCardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground text-gray-500" />
      </div>
      <div>
        {isLoading ? (
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
        ) : error ? (
          <div className="text-2xl font-bold text-red-500">Error</div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
