'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { interviewService, InterviewSessionDetail, InterviewQuestion } from '@/services/interview.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function InterviewSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  
  const [session, setSession] = useState<InterviewSessionDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const res = await interviewService.getSession(sessionId as string);
      if (res.success) {
        setSession(res.data);
        
        // Find the first unanswered question
        const firstUnanswered = res.data.questions.findIndex((q: InterviewQuestion) => !q.answer);
        if (firstUnanswered !== -1) {
          setCurrentQuestionIndex(firstUnanswered);
        } else if (res.data.status === 'completed') {
          router.replace(`/dashboard/interview-prep/results/${res.data.id}`);
        } else {
          setCurrentQuestionIndex(res.data.questions.length - 1);
        }
      }
    } catch (error) {
      toast.error('Failed to load session');
      router.push('/dashboard/interview-prep');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !session) return;
    
    setIsSubmitting(true);
    try {
      const currentQuestion = session.questions[currentQuestionIndex];
      const res = await interviewService.submitAnswer(session.id, currentQuestion.id, answerText);
      
      if (res.success) {
        toast.success('Answer submitted successfully');
        setAnswerText('');
        
        // Update local state
        const updatedSession = { ...session };
        updatedSession.questions[currentQuestionIndex].answer = res.data;
        setSession(updatedSession);
        
        // Move to next question or complete
        if (currentQuestionIndex < session.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          handleComplete();
        }
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!session) return;
    setIsCompleting(true);
    try {
      const res = await interviewService.completeSession(session.id);
      if (res.success) {
        toast.success('Interview completed!');
        router.push(`/dashboard/interview-prep/results/${session.id}`);
      }
    } catch (error) {
      toast.error('Failed to complete interview');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!session) return null;

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = (session.questions.filter(q => q.answer).length / session.total_questions) * 100;
  const isAnswered = !!currentQuestion?.answer;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold">{session.career?.title || 'General'} Mock Interview</h1>
          <p className="text-sm text-muted-foreground">{session.interview_type} • {session.difficulty}</p>
        </div>
        <Button variant="outline" onClick={() => {
          if (window.confirm("Your progress is saved, but exiting now will pause the interview. You can resume it later from the Interview Prep dashboard.")) {
            router.push('/dashboard/interview-prep');
          }
        }}>
          Exit Session
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{session.questions.filter(q => q.answer).length} of {session.total_questions} Completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="shadow-sm border-primary/20">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              <span>Question {currentQuestionIndex + 1}</span>
              <span className="opacity-50">•</span>
              <span>{currentQuestion.category}</span>
            </div>
            
            <h2 className="text-2xl font-semibold leading-tight">
              {currentQuestion.question_text}
            </h2>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Your Answer</label>
            {isAnswered ? (
              <div className="bg-muted p-4 rounded-md border text-muted-foreground">
                <p className="whitespace-pre-wrap">{currentQuestion.answer?.answer_text}</p>
                <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Answer Submitted
                </div>
              </div>
            ) : (
              <Textarea 
                placeholder="Type your answer here... Be as detailed as possible."
                className="min-h-[200px] resize-y text-base"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                disabled={isSubmitting}
              />
            )}
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{answerText.length} characters (aim for 200+)</span>
              {!isAnswered && answerText.length < 50 && answerText.length > 0 && (
                <span className="text-amber-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Too short</span>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0 || isSubmitting}
            >
              Previous
            </Button>
            
            {!isAnswered ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={!answerText.trim() || isSubmitting}
                className="gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Answer <ArrowRight className="h-4 w-4" />
              </Button>
            ) : currentQuestionIndex < session.total_questions - 1 ? (
              <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="gap-2">
                Next Question <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isCompleting} className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-white">
                {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Finish Interview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
