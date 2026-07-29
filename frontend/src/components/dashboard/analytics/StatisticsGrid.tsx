import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatItemProps {
  label: string;
  value: string | number;
}

const StatItem = ({ label, value }: StatItemProps) => (
  <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

interface StatisticsGridProps {
  careerStats: {
    highestMatch: number;
    lowestMatch: number;
    avgMatch: number;
    savedCareers: number;
    recommendationsGenerated: number;
    roadmapsGenerated: number;
    resumeAnalyses: number;
    skillGapReports: number;
  };
  learningStats: {
    skillsMastered: number;
    skillsRemaining: number;
    roadmapStepsCompleted: number;
    projectsCompleted: number;
    coursesEstimated: number;
    learningHours: number;
    certificatesEstimated: number;
  };
  interviewStats?: {
    totalInterviews: number;
    averageScore: number;
    readinessLabel: string;
  };
}

export const StatisticsGrid = React.memo(({ careerStats, learningStats, interviewStats }: StatisticsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
      <Card className="flex flex-col h-full bg-card/40 backdrop-blur-sm border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Career Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <StatItem label="Highest Career Match" value={`${careerStats.highestMatch}%`} />
          <StatItem label="Lowest Career Match" value={`${careerStats.lowestMatch}%`} />
          <StatItem label="Average Career Match" value={`${careerStats.avgMatch}%`} />
          <StatItem label="Saved Careers" value={careerStats.savedCareers} />
          <StatItem label="Recommendations Generated" value={careerStats.recommendationsGenerated} />
          <StatItem label="Roadmaps Generated" value={careerStats.roadmapsGenerated} />
          <StatItem label="Resume Analyses" value={careerStats.resumeAnalyses} />
          <StatItem label="Skill Gap Reports" value={careerStats.skillGapReports} />
        </CardContent>
      </Card>
      <Card className="flex flex-col h-full bg-card/40 backdrop-blur-sm border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Learning Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <StatItem label="Skills Mastered" value={learningStats.skillsMastered} />
          <StatItem label="Skills Remaining" value={learningStats.skillsRemaining} />
          <StatItem label="Roadmap Steps Completed" value={learningStats.roadmapStepsCompleted} />
          <StatItem label="Projects Completed" value={learningStats.projectsCompleted} />
          <StatItem label="Courses Estimated" value={learningStats.coursesEstimated} />
          <StatItem label="Learning Hours" value={`${learningStats.learningHours}h`} />
          <StatItem label="Certificates Estimated" value={learningStats.certificatesEstimated} />
        </CardContent>
      </Card>
      {interviewStats && (
        <Card className="flex flex-col h-full bg-card/40 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Interview Statistics</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <StatItem label="Total Mock Interviews" value={interviewStats.totalInterviews} />
            <StatItem label="Average Score" value={`${interviewStats.averageScore}%`} />
            <StatItem label="Readiness" value={interviewStats.readinessLabel} />
          </CardContent>
        </Card>
      )}
    </div>
  );
});

StatisticsGrid.displayName = "StatisticsGrid";
