'use client';

import { useEffect, useState } from 'react';
import { RecommendationService } from '@/services/recommendation.service';
import { ResumeService } from '@/services/resume.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, FileText } from 'lucide-react';

export default function HistoryPage() {
  const [recs, setRecs] = useState<any[]>([]);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [recsRes, resRes] = await Promise.all([
          RecommendationService.getRecommendations(),
          ResumeService.getLatestAnalysis()
        ]);
        
        if (recsRes.success) setRecs(recsRes.data);
        if (resRes.success) setResume(resRes.data);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">AI Interaction History</h1>
      <p className="text-sm text-muted-foreground mt-1">
        A log of your previous recommendations and resume analyses.
      </p>
      
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Latest Resume Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resume ? (
                <div className="space-y-2 text-sm">
                  <p><strong>Score:</strong> {resume.resume_score}</p>
                  <p><strong>Parsed Skills:</strong> {resume.skills?.join(', ') || 'None'}</p>
                  <p className="text-xs text-muted-foreground">Analyzed on: {new Date(resume.created_at).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No resumes analyzed yet.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Recent Career Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recs.length > 0 ? (
                <ul className="space-y-4">
                  {recs.map(r => (
                    <li key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <p className="font-semibold">{r.career?.title || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">Match: {r.match_percentage}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Generated: {new Date(r.created_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recommendations generated yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
