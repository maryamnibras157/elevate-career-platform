import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  icon?: LucideIcon;
  iconClassName?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconClassName,
  isLoading = false,
  className,
}: StatCardProps) {
  const isPositive = change && change.value >= 0;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className={cn('rounded-lg p-2 bg-muted', iconClassName)}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {change && (
            <p className={cn('flex items-center gap-1 text-xs', isPositive ? 'text-success' : 'text-destructive')}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isPositive ? '+' : ''}{change.value}%</span>
              {change.label && <span className="text-muted-foreground">{change.label}</span>}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
