'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { interviewService, InterviewSession, Career } from '@/services/interview.service';
import { CareerService } from '@/services/career.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mic, Loader2, Play, History, Trash2, CheckCircle2 } from 'lucide-react';

export default function InterviewPrepPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Form State
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [interviewType, setInterviewType] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState('5');

  useEffect(() => {
    fetchHistory();
    fetchCareers();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await interviewService.getSessions();
      if (res.success) setSessions(res.data);
    } catch (error) {
      toast.error('Failed to load interview history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const res = await CareerService.getCareers();
      if (res.success) setCareers(res.data);
    } catch (error) {
      console.error('Failed to load careers', error);
    }
  };

  const handleStartInterview = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        career_id: selectedCareer || undefined,
        interview_type: interviewType,
        difficulty: difficulty,
        num_questions: parseInt(numQuestions)
      };
      const res = await interviewService.createSession(payload);
      if (res.success) {
        toast.success('Interview session created!');
        router.push(`/dashboard/interview-prep/session/${res.data.id}`);
      }
    } catch (error) {
      toast.error('Failed to generate interview');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await interviewService.deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
          <Mic className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Prep</h1>
          <p className="text-muted-foreground text-sm">Practice with AI-generated mock interviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Card */}
        <Card className="md:col-span-1 h-fit shadow-sm">
          <CardHeader>
            <CardTitle>New Mock Interview</CardTitle>
            <CardDescription>Configure your practice session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Career</label>
              <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                <SelectTrigger>
                  <SelectValue placeholder="General Tech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Tech</SelectItem>
                  {careers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Interview Type</label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mixed">Mixed (Behavioral & Tech)</SelectItem>
                  <SelectItem value="Behavioral">Behavioral / HR</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner (Intern/Junior)</SelectItem>
                  <SelectItem value="Intermediate">Intermediate (Mid-Level)</SelectItem>
                  <SelectItem value="Advanced">Advanced (Senior)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Questions</label>
              <Select value={numQuestions} onValueChange={setNumQuestions}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 (Quick Practice)</SelectItem>
                  <SelectItem value="5">5 (Standard)</SelectItem>
                  <SelectItem value="10">10 (Full Interview)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartInterview} disabled={isGenerating} className="w-full gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isGenerating ? 'Generating...' : 'Start Interview'}
            </Button>
          </CardFooter>
        </Card>

        {/* History List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Recent Sessions
          </h2>
          
          {isLoadingHistory ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : sessions.length === 0 ? (
            <div className="border rounded-lg border-dashed p-12 text-center text-muted-foreground bg-muted/20">
              <Mic className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No interview sessions yet.</p>
              <p className="text-sm mt-1">Start a new mock interview to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="border rounded-lg p-4 bg-card flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">
                        {session.career?.title || 'General'} Interview
                      </h3>
                      {session.status === 'completed' && (
                        <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 className="h-3 w-3" /> {session.overall_score}%
                        </span>
                      )}
                      {session.status === 'in_progress' && (
                        <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex gap-3">
                      <span>{session.interview_type}</span>
                      <span>•</span>
                      <span>{session.difficulty}</span>
                      <span>•</span>
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {session.status === 'completed' ? (
                      <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/interview-prep/results/${session.id}`)}>
                        View Results
                      </Button>
                    ) : session.status === 'in_progress' ? (
                      <Button size="sm" onClick={() => router.push(`/dashboard/interview-prep/session/${session.id}`)}>
                        Continue
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDelete(session.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
