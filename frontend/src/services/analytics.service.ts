import { ResumeService } from './resume.service';
import { RecommendationService } from './recommendation.service';
import { RoadmapService } from './roadmap.service';
import { interviewService } from './interview.service';

export interface DashboardAnalyticsData {
  placementReadiness: number;
  resumeScore: number;
  skillsLearned: number;
  roadmapCompletion: number;
  resumeScoreHistory: { week: string; score: number }[];
  skillDistribution: { name: string; value: number }[];
  careerMatches: { name: string; value: number }[];
  roadmapsProgress: { title: string; progress: number; completedSteps: number; remainingSteps: number; totalSteps: number }[];
  monthlyActivity: { month: string; uploads: number; recommendations: number; roadmaps: number }[];
  careerStats: { highestMatch: number; lowestMatch: number; avgMatch: number; savedCareers: number; recommendationsGenerated: number; roadmapsGenerated: number; resumeAnalyses: number; skillGapReports: number };
  learningStats: { skillsMastered: number; skillsRemaining: number; roadmapStepsCompleted: number; projectsCompleted: number; coursesEstimated: number; learningHours: number; certificatesEstimated: number };
  interviewStats: { totalInterviews: number; averageScore: number; readinessLabel: string };
}

export const AnalyticsService = {
  getAnalyticsDashboardData: async (): Promise<DashboardAnalyticsData> => {
    // 1. Fetch real data where possible
    let latestResumeAnalysis = null;
    let recommendations = [];
    let roadmaps = [];
    let iSummary = { total_interviews: 0, average_score: 0, readiness_label: "Needs Preparation" };

    try {
      // Run promises in parallel
      const [resAnalysis, recs, rmaps, interviewSummary] = await Promise.all([
        ResumeService.getLatestAnalysis().catch(() => null),
        RecommendationService.getRecommendations().catch(() => ({ data: [] })),
        RoadmapService.getRoadmaps().catch(() => ({ data: [] })),
        interviewService.getSummary().catch(() => ({ data: { total_interviews: 0, average_score: 0, readiness_label: "Needs Preparation" } }))
      ]);

      latestResumeAnalysis = resAnalysis?.data || null;
      recommendations = recs?.data || [];
      roadmaps = rmaps?.data || [];
      iSummary = interviewSummary?.data || { total_interviews: 0, average_score: 0, readiness_label: "Needs Preparation" };
    } catch (error) {
      console.warn("Failed to fetch some backend data, using default/mock values.", error);
    }

    // --- Compute base metrics ---
    const resumeScore = latestResumeAnalysis?.resume_score || 74;
    
    // Career Matches
    const highestMatch = recommendations.length > 0 ? Math.max(...recommendations.map((r: any) => r.match_percentage)) : 88;
    const lowestMatch = recommendations.length > 0 ? Math.min(...recommendations.map((r: any) => r.match_percentage)) : 65;
    const avgMatch = recommendations.length > 0 ? Math.round(recommendations.reduce((acc: number, r: any) => acc + r.match_percentage, 0) / recommendations.length) : 78;

    const careerMatches = recommendations.length > 0 
      ? recommendations.slice(0, 4).map((r: any) => ({ name: r.career?.title || 'Unknown Role', value: r.match_percentage }))
      : [
          { name: 'Software Engineer', value: 92 },
          { name: 'AI Engineer', value: 89 },
          { name: 'Cloud Engineer', value: 84 },
          { name: 'Cyber Security', value: 79 }
        ];

    // Roadmap Progress
    const roadmapsProgress = roadmaps.length > 0 
      ? roadmaps.map((rm: any) => {
          const totalSteps = rm.steps?.length || 10;
          const completedSteps = rm.steps?.filter((s: any) => s.is_completed).length || 0;
          return {
            title: rm.career?.title || 'Tech Roadmap',
            progress: Math.round((completedSteps / totalSteps) * 100),
            completedSteps,
            remainingSteps: totalSteps - completedSteps,
            totalSteps
          };
        })
      : [
          { title: 'Software Engineering Roadmap', progress: 45, completedSteps: 12, remainingSteps: 15, totalSteps: 27 },
          { title: 'Cloud Infrastructure', progress: 20, completedSteps: 4, remainingSteps: 16, totalSteps: 20 }
        ];

    const roadmapCompletion = roadmapsProgress.length > 0 
      ? Math.round(roadmapsProgress.reduce((acc: number, rm: any) => acc + rm.progress, 0) / roadmapsProgress.length)
      : 34;

    const roadmapStepsCompleted = roadmapsProgress.reduce((acc: number, rm: any) => acc + rm.completedSteps, 0);

    // AI Placement Readiness Score (Weighted Average)
    // Formula: 40% Resume Score + 30% Avg Career Match + 30% Roadmap Completion
    const placementReadiness = Math.round((resumeScore * 0.4) + (avgMatch * 0.3) + (roadmapCompletion * 0.3));

    // Skill Distribution (Mocked if real parsed skills aren't easily categorizable)
    const skillDistribution = [
      { name: 'Frontend', value: 35 },
      { name: 'Backend', value: 45 },
      { name: 'Databases', value: 20 },
      { name: 'Cloud/DevOps', value: 15 },
      { name: 'Soft Skills', value: 10 }
    ];

    // Resume Score History (Mocked historical data trending towards current score)
    const baseScore = Math.max(30, resumeScore - 20);
    const resumeScoreHistory = [
      { week: 'Week 1', score: baseScore },
      { week: 'Week 2', score: baseScore + 4 },
      { week: 'Week 3', score: baseScore + 7 },
      { week: 'Week 4', score: baseScore + 12 },
      { week: 'Week 5', score: baseScore + 16 },
      { week: 'Week 6', score: resumeScore },
    ];

    // Monthly Learning Activity (Mocked)
    const monthlyActivity = [
      { month: 'Jan', uploads: 1, recommendations: 2, roadmaps: 0 },
      { month: 'Feb', uploads: 2, recommendations: 4, roadmaps: 1 },
      { month: 'Mar', uploads: 1, recommendations: 1, roadmaps: 0 },
      { month: 'Apr', uploads: 3, recommendations: 5, roadmaps: 2 },
      { month: 'May', uploads: 2, recommendations: 3, roadmaps: 1 },
      { month: 'Jun', uploads: 4, recommendations: 6, roadmaps: 3 },
    ];

    return {
      placementReadiness,
      resumeScore,
      skillsLearned: 18,
      roadmapCompletion,
      resumeScoreHistory,
      skillDistribution,
      careerMatches,
      roadmapsProgress,
      monthlyActivity,
      careerStats: {
        highestMatch,
        lowestMatch,
        avgMatch,
        savedCareers: recommendations.length > 0 ? recommendations.filter((r: any) => r.is_saved).length : 5,
        recommendationsGenerated: recommendations.length || 12,
        roadmapsGenerated: roadmaps.length || 3,
        resumeAnalyses: 8,
        skillGapReports: 4
      },
      learningStats: {
        skillsMastered: 18,
        skillsRemaining: 24,
        roadmapStepsCompleted,
        projectsCompleted: 3,
        coursesEstimated: 5,
        learningHours: 120,
        certificatesEstimated: 2
      },
      interviewStats: {
        totalInterviews: iSummary.total_interviews,
        averageScore: iSummary.average_score,
        readinessLabel: iSummary.readiness_label
      }
    };
  }
};
