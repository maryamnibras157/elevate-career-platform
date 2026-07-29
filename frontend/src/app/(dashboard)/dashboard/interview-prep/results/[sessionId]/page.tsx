'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { interviewService, InterviewSessionDetail } from '@/services/interview.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Trophy, AlertCircle, CheckCircle2, ThumbsUp, Lightbulb, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function InterviewResultsPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<InterviewSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await interviewService.getSession(sessionId as string);
      if (res.success) {
        setSession(res.data);
      }
    } catch (error) {
      toast.error('Failed to load results');
      router.push('/dashboard/interview-prep');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!session) return null;

  const score = session.overall_score || 0;
  
  let label = "Needs Preparation";
  let labelColor = "text-red-600 bg-red-100";
  let icon = <AlertCircle className="h-6 w-6 text-red-600" />;
  
  if (score >= 85) {
    label = "Strong Candidate";
    labelColor = "text-emerald-700 bg-emerald-100";
    icon = <Trophy className="h-6 w-6 text-emerald-600" />;
  } else if (score >= 70) {
    label = "Interview Ready";
    labelColor = "text-blue-700 bg-blue-100";
    icon = <CheckCircle2 className="h-6 w-6 text-blue-600" />;
  } else if (score >= 50) {
    label = "Developing";
    labelColor = "text-amber-700 bg-amber-100";
    icon = <Target className="h-6 w-6 text-amber-600" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/interview-prep')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Results</h1>
          <p className="text-muted-foreground text-sm">{session.career?.title || 'General'} • {session.interview_type} • {session.difficulty}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Overview */}
        <Card className="md:col-span-1 shadow-sm border-t-4 border-t-primary">
          <CardContent className="p-6 text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
              <div className="text-5xl font-bold tracking-tighter">{score}<span className="text-2xl text-muted-foreground font-normal">/100</span></div>
            </div>
            
            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium", labelColor)}>
              {icon}
              {label}
            </div>

            <Progress value={score} className="h-3" />
            
            <div className="pt-4 space-y-3">
              <Button onClick={() => router.push('/dashboard/interview-prep')} className="w-full" variant="outline">
                Start New Interview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-sm border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                  <ThumbsUp className="h-5 w-5" /> Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session.strengths && session.strengths.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-emerald-800/80">
                    {session.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : <p className="text-sm text-emerald-800/60">No specific strengths identified.</p>}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-amber-500/20 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                  <Lightbulb className="h-5 w-5" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session.weaknesses && session.weaknesses.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-amber-800/80">
                    {session.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                ) : <p className="text-sm text-amber-800/60">No specific weaknesses identified.</p>}
              </CardContent>
            </Card>
          </div>
          
          {session.recommendations && session.recommendations.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recommended Action Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {session.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex items-center justify-center bg-primary/10 text-primary h-6 w-6 rounded-full shrink-0 font-medium">{i+1}</span>
                      <span className="mt-0.5">{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-bold">Detailed Review</h2>
        <div className="space-y-6">
          {session.questions.map((q, i) => (
            <Card key={q.id} className="shadow-sm overflow-hidden">
              <div className="bg-muted/50 p-4 border-b">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-semibold text-foreground">
                    <span className="text-muted-foreground mr-2">Q{i+1}.</span>
                    {q.question_text}
                  </h3>
                  <div className="bg-background px-3 py-1 rounded-full border text-sm font-medium shrink-0 shadow-sm">
                    {q.answer?.score || 0}/100
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Answer</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded-md border border-dashed whitespace-pre-wrap">
                    {q.answer?.answer_text || "No answer provided."}
                  </p>
                </div>
                
                {q.answer?.feedback && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Feedback</h4>
                    <p className="text-sm text-foreground/90">{q.answer.feedback}</p>
                  </div>
                )}
                
                {q.answer?.suggested_answer && (
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Ideal Response Structure</h4>
                    <p className="text-sm text-emerald-800 bg-emerald-50 p-3 rounded-md border border-emerald-100">
                      {q.answer.suggested_answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
