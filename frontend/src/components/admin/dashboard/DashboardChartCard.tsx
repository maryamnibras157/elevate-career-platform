'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface DashboardChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: boolean;
  empty?: boolean;
}

export function DashboardChartCard({ title, description, children, isLoading, error, empty }: DashboardChartCardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-1 flex flex-col p-6 h-[400px]">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
        {description && <p className="text-sm text-muted-foreground text-gray-500">{description}</p>}
      </div>
      <div className="flex-1 w-full relative flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-gray-500">Loading chart data...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">Failed to load chart data.</div>
        ) : empty ? (
          <div className="text-sm text-gray-500">No data available for this period.</div>
        ) : (
          <div className="absolute inset-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
