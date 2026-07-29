import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export const AnalyticsCard = React.memo(({
  title,
  value,
  description,
  change,
  icon: Icon,
  iconColor = 'text-primary',
  className
}: AnalyticsCardProps) => {
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-md border-border/40 bg-card/50 backdrop-blur-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg bg-muted/50", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {change && (
            <div className="flex items-center space-x-2 mt-2">
              <span className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                change.trend === 'up' ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20" :
                change.trend === 'down' ? "bg-rose-500/10 text-rose-500 ring-rose-500/20" :
                "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20"
              )}>
                {change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}
                {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-muted-foreground">{change.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

AnalyticsCard.displayName = "AnalyticsCard";
