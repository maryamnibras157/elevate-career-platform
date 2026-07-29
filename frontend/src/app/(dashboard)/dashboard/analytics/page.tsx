"use client";

import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, BookOpen, Map } from 'lucide-react';
import { AnalyticsHeader } from '@/components/dashboard/analytics/AnalyticsHeader';
import { AnalyticsCard } from '@/components/dashboard/analytics/AnalyticsCard';
import { CircularProgressCard } from '@/components/dashboard/analytics/CircularProgressCard';
import { InsightCard } from '@/components/dashboard/analytics/InsightCard';
import { StatisticsGrid } from '@/components/dashboard/analytics/StatisticsGrid';
import { RoadmapProgressAnalytics } from '@/components/dashboard/analytics/RoadmapProgressAnalytics';
import { LineChartCard } from '@/components/dashboard/analytics/charts/LineChartCard';
import { PieChartCard } from '@/components/dashboard/analytics/charts/PieChartCard';
import { BarChartCard } from '@/components/dashboard/analytics/charts/BarChartCard';
import { AreaChartCard } from '@/components/dashboard/analytics/charts/AreaChartCard';
import { AnalyticsService, DashboardAnalyticsData } from '@/services/analytics.service';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await AnalyticsService.getAnalyticsDashboardData();
        setData(result);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-20 w-full animate-pulse bg-muted/50 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <AnalyticsHeader />
        <div className="flex flex-col items-center justify-center h-[50vh] text-center border rounded-lg bg-card/50">
          <p className="text-muted-foreground text-lg mb-2">Unable to load analytics data.</p>
          <p className="text-sm text-muted-foreground">Please try again later or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  // Generate dynamic insights
  const insights = [
    { id: '1', type: 'positive' as const, message: `Your average career match score is a strong ${data.careerStats.avgMatch}%.` },
    { id: '2', type: 'info' as const, message: `You have ${data.learningStats.skillsRemaining} skills left to master in your current roadmaps.` },
    { id: '3', type: data.resumeScore < 60 ? 'warning' as const : 'action' as const, message: `Updating your resume with your newly learned skills could boost your score by ~8%.` }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" id="analytics-dashboard-content">
      <AnalyticsHeader />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Placement Readiness" 
          value={`${data.placementReadiness}%`} 
          description="Overall Readiness"
          change={{ value: 4, label: 'this month', trend: 'up' }}
          icon={Target}
          iconColor="text-emerald-500"
        />
        <AnalyticsCard 
          title="Resume Score" 
          value={`${data.resumeScore}/100`} 
          description="AI Evaluated"
          change={{ value: 2, label: 'vs last week', trend: 'up' }}
          icon={TrendingUp}
          iconColor="text-blue-500"
        />
        <AnalyticsCard 
          title="Skills Learned" 
          value={data.skillsLearned} 
          description="Across all roadmaps"
          change={{ value: 3, label: 'this week', trend: 'up' }}
          icon={BookOpen}
          iconColor="text-amber-500"
        />
        <AnalyticsCard 
          title="Roadmap Completion" 
          value={`${data.roadmapCompletion}%`} 
          description="Average completion"
          change={{ value: 12, label: 'this month', trend: 'up' }}
          icon={Map}
          iconColor="text-purple-500"
        />
      </div>

      {/* Main Content Grid 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Circular Dial */}
        <div className="lg:col-span-1">
          <CircularProgressCard 
            title="AI Readiness Score" 
            score={data.placementReadiness} 
            description="Your readiness is calculated based on resume strength, skill acquisition, and roadmap progress. Keep learning to improve!"
          />
        </div>

        {/* Resume Score History Line Chart */}
        <div className="lg:col-span-2">
          <LineChartCard 
            title="Resume Score History" 
            description="Track how your resume has improved over time."
            data={data.resumeScoreHistory} 
          />
        </div>
      </div>

      {/* Main Content Grid 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Learning Activity Area Chart */}
        <div className="lg:col-span-2">
          <AreaChartCard 
            title="Monthly Learning Activity" 
            description="Uploads and generated recommendations over the past 6 months."
            data={data.monthlyActivity}
          />
        </div>

        {/* Skill Distribution Pie Chart */}
        <div className="lg:col-span-1">
          <PieChartCard 
            title="Skill Distribution" 
            description="Categories of skills you are currently focusing on."
            data={data.skillDistribution} 
          />
        </div>
      </div>

      {/* Main Content Grid 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Career Matches Bar Chart */}
        <div>
          <BarChartCard 
            title="Top Career Matches" 
            description="Based on your latest skills and resume."
            data={data.careerMatches}
          />
        </div>

        {/* Roadmap Progress Multi-Bars */}
        <div>
          <RoadmapProgressAnalytics roadmaps={data.roadmapsProgress} />
        </div>
      </div>

      {/* Bottom Grid for Statistics & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatisticsGrid careerStats={data.careerStats} learningStats={data.learningStats} interviewStats={data.interviewStats} />
        </div>
        <div className="lg:col-span-1">
          <InsightCard insights={insights} />
        </div>
      </div>

    </div>
  );
}
