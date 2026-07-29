'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function UserGrowthChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis 
          dataKey="label" 
          tickFormatter={(val) => {
            // Simple truncation for long dates if necessary
            return val && val.length > 10 ? val.substring(0, 10) : val;
          }} 
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
        <Line 
          type="monotone" 
          dataKey="count" 
          name="New Users"
          stroke="#0ea5e9" 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
          activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
