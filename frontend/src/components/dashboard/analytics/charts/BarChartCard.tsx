import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { ChartCard } from '../ChartCard';

interface BarChartCardProps {
  data: any[];
  title: string;
  description?: string;
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];

export const BarChartCard = React.memo(({ data, title, description }: BarChartCardProps) => {
  return (
    <ChartCard title={title} description={description}>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} width={120} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted-foreground) / 0.1)' }}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="value" name="Match Score %" radius={[0, 4, 4, 0]} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No data available.
        </div>
      )}
    </ChartCard>
  );
});

BarChartCard.displayName = "BarChartCard";
