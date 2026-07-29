'use client';

import { useEffect, useState, Suspense } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { RoadmapService } from '@/services/roadmap.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, CheckCircle2, Circle, Clock, BookOpen } from 'lucide-react';

function RoadmapContent() {
  const searchParams = useSearchParams();
  const careerId = searchParams.get('career') || '00000000-0000-0000-0000-000000000000';
  
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await RoadmapService.getRoadmaps();
        if (res.success) {
          if (res.data.length === 0 && careerId !== '00000000-0000-0000-0000-000000000000') {
            const toastId = toast.loading('Generating AI Roadmap...');
            try {
              const generated = await RoadmapService.generateRoadmap(careerId);

              if (generated.success) {
                const refreshed = await RoadmapService.getRoadmaps();

                if (refreshed.success) {
                  setRoadmaps(refreshed.data);
                }

                toast.success("Roadmap generated successfully!", {
                  id: toastId,
                });
              } else {
                toast.error("Failed to generate roadmap.", {
                  id: toastId,
                });
              }
            } catch (err) {
              toast.error('Error generating roadmap', { id: toastId });
            }
          } else {
            setRoadmaps(res.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, [careerId]);

  const handleToggleStep = async (stepId: string, current: boolean) => {
    try {
      const res = await RoadmapService.updateStep(stepId, !current);
      if (res.success) {
        setRoadmaps(prev => prev.map(rm => ({
          ...rm,
          steps: rm.steps.map((s: any) => s.id === stepId ? { ...s, is_completed: !current } : s)
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Career Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your personalized step-by-step learning path to achieve your career goals.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : roadmaps.length > 0 ? (
        <div className="space-y-8">
          {roadmaps.map(roadmap => (
            <Card key={roadmap.id} className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Map className="w-5 h-5 text-primary" />
                      {roadmap.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Current Level: <Badge variant="outline">{roadmap.current_level}</Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((roadmap.steps.filter((s: any) => s.is_completed).length / (roadmap.steps.length || 1)) * 100)}%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 relative">
                {/* Timeline Line */}
                <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-border hidden sm:block"></div>
                
                <div className="space-y-6">
                  {roadmap.steps.map((step: any, idx: number) => (
                    <div key={step.id} className="relative flex items-start gap-4 sm:gap-6 group">
                      {/* Step Indicator */}
                      <div className="hidden sm:flex relative z-10 w-8 h-8 rounded-full bg-background border-2 border-muted items-center justify-center shrink-0 transition-colors group-hover:border-primary">
                        {step.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-3 h-3 text-muted-foreground fill-muted" />
                        )}
                      </div>
                      
                      {/* Step Content */}
                      <div className="flex-1">
                        <Card className={`transition-colors ${step.is_completed ? 'bg-secondary/30 border-primary/20' : 'hover:border-primary/50'}`}>
                          <CardContent className="p-4 flex gap-4">
                            <div className="pt-1">
                              <Checkbox 
                                checked={step.is_completed} 
                                onCheckedChange={() => handleToggleStep(step.id, step.is_completed)}
                                className="w-5 h-5 rounded-full"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h3 className={`font-semibold ${step.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                  {step.title}
                                </h3>
                                <Badge variant="secondary" className="w-fit text-xs">
                                  {step.level}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  {step.category}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {step.estimated_duration}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No roadmaps found.
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96 w-full max-w-4xl mx-auto" /></div>}>
      <RoadmapContent />
    </Suspense>
  );
}
