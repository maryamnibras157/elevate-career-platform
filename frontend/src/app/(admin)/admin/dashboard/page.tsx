'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { adminApi } from '@/services/adminApi';
import { Users, Briefcase, FileText, Calendar, MessageSquare, Map, RefreshCw } from 'lucide-react';
import { DashboardStatCard } from '@/components/admin/dashboard/DashboardStatCard';
import { DashboardChartCard } from '@/components/admin/dashboard/DashboardChartCard';
import { DashboardQuickActions } from '@/components/admin/dashboard/DashboardQuickActions';
import { DashboardRecentActivity } from '@/components/admin/dashboard/DashboardRecentActivity';
import { UserGrowthChart } from '@/components/admin/dashboard/charts/UserGrowthChart';
import { CareerGrowthChart } from '@/components/admin/dashboard/charts/CareerGrowthChart';
import { ResumeTrendsChart } from '@/components/admin/dashboard/charts/ResumeTrendsChart';
import { InterviewStatsChart } from '@/components/admin/dashboard/charts/InterviewStatsChart';
import { MentorUsageChart } from '@/components/admin/dashboard/charts/MentorUsageChart';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';

export default function AdminDashboardPage() {
  const { 
    dashboardFilterDays, 
    dashboardPeriod, 
    setDashboardFilterDays, 
    setDashboardPeriod, 
    refreshTrigger, 
    triggerRefresh,
    hasPermission 
  } = useAdminStore();

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>({
    userGrowth: null,
    careerGrowth: null,
    resumeTrends: null,
    interviews: null,
    mentorUsage: null,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Calculate date range based on filter days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - dashboardFilterDays);

      const dateParams = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        period: dashboardPeriod,
      };

      // Execute all allowed API calls in parallel
      const tasks = [];
      const keys: string[] = [];

      tasks.push(adminApi.getDashboardSummary().then(res => res.data));
      keys.push('summary');

      if (hasPermission('VIEW_ANALYTICS')) {
        tasks.push(adminApi.getAnalyticsUserGrowth(dateParams).then(res => res.data));
        keys.push('userGrowth');
        
        tasks.push(adminApi.getAnalyticsCareerGrowth(dateParams).then(res => res.data));
        keys.push('careerGrowth');
        
        tasks.push(adminApi.getAnalyticsResumeTrends(dateParams).then(res => res.data));
        keys.push('resumeTrends');
        
        tasks.push(adminApi.getAnalyticsInterviews(dateParams).then(res => res.data));
        keys.push('interviews');
        
        tasks.push(adminApi.getAnalyticsMentorUsage(dateParams).then(res => res.data));
        keys.push('mentorUsage');
      }

      const results = await Promise.allSettled(tasks);
      
      const newAnalytics = { ...analytics };
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (keys[index] === 'summary') {
            setSummary(result.value);
          } else {
            newAnalytics[keys[index]] = result.value;
          }
        } else {
          console.error(`Failed to fetch ${keys[index]}`, result.reason);
          toast.error(`Failed to load ${keys[index]} data`);
        }
      });

      setAnalytics(newAnalytics);
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while fetching dashboard data.');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardFilterDays, dashboardPeriod, refreshTrigger, hasPermission]); // Excluded analytics from dependency array to avoid loops

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = [
    { title: 'Total Users', value: summary?.total_users || 0, desc: 'Registered accounts', icon: Users },
    { title: 'Active Users', value: summary?.active_users || 0, desc: 'Currently active', icon: Users },
    { title: 'Total Careers', value: summary?.total_careers || 0, desc: 'Career paths in DB', icon: Briefcase },
    { title: 'Published Careers', value: summary?.published_careers || 0, desc: 'Visible to users', icon: Briefcase },
    { title: 'Resume Uploads', value: summary?.total_resume_uploads || 0, desc: 'Processed resumes', icon: FileText },
    { title: 'Interviews', value: summary?.total_interviews || 0, desc: 'Sessions created', icon: Calendar },
    { title: 'AI Mentor Sessions', value: summary?.ai_mentor_sessions || 0, desc: 'Chat sessions', icon: MessageSquare },
    { title: 'Roadmaps Generated', value: summary?.roadmaps_generated || 0, desc: 'Career roadmaps', icon: Map },
  ];

  return (
    <PageShell
      title="Dashboard"
      description="System overview and analytics."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Dashboard' }
      ]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={dashboardFilterDays}
            onChange={(e) => setDashboardFilterDays(Number(e.target.value))}
            aria-label="Filter Days"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
          </select>
          
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={dashboardPeriod}
            onChange={(e) => setDashboardPeriod(e.target.value as any)}
            aria-label="Filter Period"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          
          <button 
            onClick={triggerRefresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <DashboardStatCard 
              key={i}
              title={kpi.title}
              value={kpi.value}
              description={kpi.desc}
              icon={kpi.icon}
              isLoading={isLoading && !summary}
              error={!isLoading && !summary}
            />
          ))}
        </div>

        {hasPermission('VIEW_ANALYTICS') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardChartCard 
              title="User Growth" 
              description={`New registrations per ${dashboardPeriod}`}
              isLoading={isLoading && !analytics.userGrowth}
              error={!isLoading && !analytics.userGrowth}
              empty={analytics.userGrowth?.data?.length === 0}
            >
              <UserGrowthChart data={analytics.userGrowth?.data} />
            </DashboardChartCard>

            <DashboardChartCard 
              title="Career Growth" 
              description={`Careers added per ${dashboardPeriod}`}
              isLoading={isLoading && !analytics.careerGrowth}
              error={!isLoading && !analytics.careerGrowth}
              empty={analytics.careerGrowth?.data?.length === 0}
            >
              <CareerGrowthChart data={analytics.careerGrowth?.data} />
            </DashboardChartCard>
            
            <DashboardChartCard 
              title="Resume Upload Trends" 
              description={`Resumes processed per ${dashboardPeriod}`}
              isLoading={isLoading && !analytics.resumeTrends}
              error={!isLoading && !analytics.resumeTrends}
              empty={analytics.resumeTrends?.uploads_data?.length === 0}
            >
              <ResumeTrendsChart data={analytics.resumeTrends?.uploads_data} />
            </DashboardChartCard>

            <DashboardChartCard 
              title="Interview Types" 
              description="Distribution of interview sessions"
              isLoading={isLoading && !analytics.interviews}
              error={!isLoading && !analytics.interviews}
              empty={(analytics.interviews?.technical_count || 0) === 0 && (analytics.interviews?.behavioral_count || 0) === 0}
            >
              <InterviewStatsChart data={analytics.interviews} />
            </DashboardChartCard>
            
            <DashboardChartCard 
              title="AI Mentor Usage" 
              description="Total mentor sessions recorded"
              isLoading={isLoading && !analytics.mentorUsage}
              error={!isLoading && !analytics.mentorUsage}
              empty={(analytics.mentorUsage?.total_sessions || 0) === 0}
            >
              <MentorUsageChart data={analytics.mentorUsage} />
            </DashboardChartCard>
            
            <div className="flex flex-col gap-4">
              <DashboardQuickActions />
              <DashboardRecentActivity />
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
