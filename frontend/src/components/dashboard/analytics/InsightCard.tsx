import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface Insight {
  id: string;
  type: 'positive' | 'action' | 'warning' | 'info';
  message: string;
}

interface InsightCardProps {
  insights: Insight[];
}

export const InsightCard = React.memo(({ insights }: InsightCardProps) => {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5" />;
      case 'action': return <Zap className="h-4 w-4 text-amber-500 mt-0.5" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5" />;
      case 'info':
      default: return <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No insights available at the moment.</p>
        ) : (
          insights.map((insight) => (
            <div key={insight.id} className="flex gap-3 bg-muted/30 p-3 rounded-md items-start">
              {getIcon(insight.type)}
              <p className="text-sm font-medium leading-tight text-foreground/90">{insight.message}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
});

InsightCard.displayName = "InsightCard";
