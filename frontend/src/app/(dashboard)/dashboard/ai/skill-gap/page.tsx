'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SkillGapService } from '@/services/skillgap.service';
import { RecommendationService } from '@/services/recommendation.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ListChecks, AlertTriangle, Clock } from 'lucide-react';
import {
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';

export default function SkillGapPage() {
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const res = await SkillGapService.getSkillGaps();
        if (res.success) {
          if (res.data.length === 0) {
            // Auto-generate for top career recommendation
            const recsRes = await RecommendationService.getRecommendations();
            if (recsRes.success && recsRes.data.length > 0) {
              const topCareerId = recsRes.data[0].career_id;
              const generated = await SkillGapService.generateSkillGap(topCareerId);
              if (generated.success) {
                setGaps([generated.data]);
                toast.success('Generated skill gap analysis for your top match');
              }
            } else {
              setGaps([]);
            }
          } else {
            setGaps(res.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGaps();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skill Gap Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare your current skill set with industry requirements for your target careers.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : gaps.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {gaps.map((gap, i) => {
            const chartData = [
              { name: 'Gap', value: gap.gap_percentage, fill: 'hsl(var(--destructive))' },
              { name: 'Match', value: 100 - gap.gap_percentage, fill: 'hsl(var(--success))' }
            ];

            return (
              <Card key={gap.id || i}>
                <CardHeader>
                  <CardTitle className="text-xl">Gap Analysis: {gap.career?.title || 'Unknown Career'}</CardTitle>
                  <CardDescription>Based on your profile vs required skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="h-48 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" cy="50%" 
                          innerRadius="60%" outerRadius="100%" 
                          barSize={15} data={chartData}
                        >
                          <RadialBar background dataKey="value" cornerRadius={10} />
                          <RechartsTooltip />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-destructive">{gap.gap_percentage}%</span>
                        <span className="text-xs text-muted-foreground uppercase">Gap</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          Priority Skills Needed
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {gap.priority_skills?.map((s: string) => (
                            <Badge key={s} variant="destructive">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <ListChecks className="w-4 h-4 text-primary" />
                          Other Missing Tech
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {gap.missing_technologies?.map((s: string) => (
                            <Badge key={s} variant="outline">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-4 p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Est. Time: <span className="font-medium text-foreground">{gap.estimated_learning_time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No skill gap analysis found. Try generating a recommendation first.
        </div>
      )}
    </div>
  );
}
