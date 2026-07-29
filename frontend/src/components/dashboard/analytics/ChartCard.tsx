import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const ChartCard = React.memo(({ title, description, children, className, contentClassName }: ChartCardProps) => {
  return (
    <Card className={cn("flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md border-border/40 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className={cn("flex-1 min-h-[300px]", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
});

ChartCard.displayName = "ChartCard";
