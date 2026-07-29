'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { ExecutiveMetricsOut } from '@/types/admin';
import { 
  Loader2, Users, Briefcase, FileText, Calendar, 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export default function ExecutiveDashboardPage() {
  const [metrics, setMetrics] = useState<ExecutiveMetricsOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getExecutiveMetrics();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      toast.error('Failed to load executive metrics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-center p-12 text-gray-500">No data available</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Executive Dashboard</h2>
        <p className="text-muted-foreground text-gray-500 mt-1">High-level overview of platform growth and feature utilization.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <h3 className="text-3xl font-bold mt-1">{metrics.total_users.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Careers</p>
            <h3 className="text-3xl font-bold mt-1">{metrics.total_careers.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center dark:bg-green-900/30 dark:text-green-400">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Resumes Analyzed</p>
            <h3 className="text-3xl font-bold mt-1">{metrics.total_resumes.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center dark:bg-indigo-900/30 dark:text-indigo-400">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Interview Sessions</p>
            <h3 className="text-3xl font-bold mt-1">{metrics.total_interviews.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center dark:bg-amber-900/30 dark:text-amber-400">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-500" /> User Registration Growth (30 Days)
          </h3>
          <div className="h-[300px]">
            {metrics.user_growth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.user_growth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} minTickGap={30} stroke="#9ca3af" />
                  <YAxis tick={{fontSize: 12}} stroke="#9ca3af" />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Platform Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-indigo-500" /> Platform Activity Events (30 Days)
          </h3>
          <div className="h-[300px]">
            {metrics.platform_activity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.platform_activity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} minTickGap={30} stroke="#9ca3af" />
                  <YAxis tick={{fontSize: 12}} stroke="#9ca3af" />
                  <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Audit Events" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Career Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <PieChartIcon className="h-5 w-5 text-green-500" /> Careers by Category
          </h3>
          <div className="h-[300px]">
            {metrics.career_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.career_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {metrics.career_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Resume Scores */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-amber-500" /> Resume Score Distribution
          </h3>
          <div className="h-[300px]">
            {metrics.resume_scores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.resume_scores} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} />
                  <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Resumes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
