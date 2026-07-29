import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RoadmapProgressItem {
  title: string;
  progress: number;
  completedSteps: number;
  remainingSteps: number;
  totalSteps: number;
}

interface RoadmapProgressAnalyticsProps {
  roadmaps: RoadmapProgressItem[];
}

export const RoadmapProgressAnalytics = React.memo(({ roadmaps }: RoadmapProgressAnalyticsProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Roadmap Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {roadmaps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active roadmaps found.</p>
        ) : (
          roadmaps.map((roadmap, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium truncate pr-4">{roadmap.title}</span>
                <span className="font-bold">{roadmap.progress}%</span>
              </div>
              <Progress value={roadmap.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{roadmap.completedSteps} Completed Steps</span>
                <span>{roadmap.remainingSteps} Remaining Steps</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
});

RoadmapProgressAnalytics.displayName = "RoadmapProgressAnalytics";
