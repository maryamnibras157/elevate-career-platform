'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MentorUsageChart({ data }: { data: any }) {
  if (!data) return null;

  // Since the backend doesn't provide time-series data for mentor usage yet, we'll display a placeholder
  // using the aggregate totals provided by the analytics endpoint just to have a visual representation.
  // In a real scenario, the backend endpoint for mentor usage would need to be updated to return 
  // time-series data like get_user_growth does.
  
  // Create a synthetic array to display the total sessions over a mock time axis for now
  const chartData = [
    { label: 'Start', value: 0 },
    { label: 'Current', value: data.total_sessions || 0 },
  ];

  if ((data.total_sessions || 0) === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorMentor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis 
          dataKey="label" 
          tick={{ fill: '#6b7280', fontSize: 12 }} 
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
          width={40}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          name="Sessions"
          stroke="#f97316" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorMentor)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
