'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardService } from '@/services/dashboard.service';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3, FileText, Map, Target, ArrowRight,
  CheckCircle, Clock, AlertCircle, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const recentActivity = [
  { id: 1, action: 'Resume uploaded and analyzed', time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'success' },
  { id: 2, action: 'Career roadmap generated for Software Engineering', time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'success' },
  { id: 3, action: 'Skill gap analysis completed', time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'success' },
  { id: 4, action: 'Profile setup pending — add work experience', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'warning' },
];

const upcomingTasks = [
  { id: 1, title: 'Complete your skills profile', description: 'Add at least 10 skills to get better recommendations', priority: 'high', href: '/dashboard/profile' },
  { id: 2, title: 'Upload your resume', description: 'Get an ATS score and detailed feedback', priority: 'medium', href: '/dashboard/ai/resume-analysis' },
  { id: 3, title: 'Review career roadmap', description: '3 new milestones added to your Software Engineering path', priority: 'low', href: '/dashboard/roadmap' },
];

const quickLinks = [
  { icon: FileText, label: 'Analyze Resume', desc: 'Upload and score your resume', href: '/dashboard/ai/resume-analysis' },
  { icon: Target, label: 'Career Discovery', desc: 'Find roles that match your profile', href: '/dashboard/careers' },
  { icon: Map, label: 'Career Roadmap', desc: 'View your personalized path', href: '/dashboard/roadmap' },
  { icon: BarChart3, label: 'Analytics', desc: 'Track your placement readiness', href: '/dashboard/analytics' },
];

const statusIcon = (status: string) => {
  if (status === 'success') return <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />;
  if (status === 'warning') return <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" />;
  return <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
};

const priorityVariant = (p: string) => {
  if (p === 'high') return 'destructive' as const;
  if (p === 'medium') return 'warning' as const;
  return 'muted' as const;
};

export function DashboardContent() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await DashboardService.getSummary();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here is a summary of your career progress.
          </p>
        </div>
        <Link href="/dashboard/ai/resume-analysis">
          <Button size="sm">
            Analyze resume
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Career Match"
              value={data?.latest_recommendation ? `${data.latest_recommendation.match}%` : "N/A"}
              change={{ value: 2, label: 'vs last week' }}
              icon={Target}
              iconClassName="bg-primary/10 text-primary"
            />
            <StatCard
              title="Resume Score"
              value={data?.resume_score ? `${data.resume_score}/100` : "N/A"}
              change={{ value: 5, label: 'after update' }}
              icon={FileText}
              iconClassName="bg-success/10 text-success"
            />
            <StatCard
              title="Skill Gap"
              value={data?.skill_gap ? `${data.skill_gap}%` : "N/A"}
              change={{ value: 12, label: 'reduced' }}
              icon={CheckCircle}
              iconClassName="bg-accent/10 text-accent"
            />
            <StatCard
              title="Roadmap Progress"
              value={data?.roadmap_progress ? `${data.roadmap_progress}%` : "0%"}
              change={{ value: 4, label: 'this week' }}
              icon={Map}
              iconClassName="bg-warning/10 text-warning"
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Your latest actions and AI insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-start gap-3">
                    {statusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(item.time)}
                      </p>
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <link.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{link.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle>Upcoming tasks</CardTitle>
              <CardDescription>Recommended next steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={task.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      <Badge variant={priorityVariant(task.priority)} className="shrink-0 text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                    <Link href={task.href}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Start
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                  {index < upcomingTasks.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
