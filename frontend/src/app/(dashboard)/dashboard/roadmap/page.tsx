import type { Metadata } from 'next';
import { Map, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Career Roadmap' };

const milestones = [
  { title: 'Foundation Skills', status: 'complete', duration: 'Month 1-2' },
  { title: 'Core Technical Skills', status: 'in-progress', duration: 'Month 3-4' },
  { title: 'Portfolio Projects', status: 'upcoming', duration: 'Month 5-6' },
  { title: 'Internship Applications', status: 'upcoming', duration: 'Month 7' },
  { title: 'Interview Preparation', status: 'upcoming', duration: 'Month 8-9' },
  { title: 'Placement', status: 'upcoming', duration: 'Month 10+' },
];

export default function CareerRoadmapPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Badge variant="outline" className="mb-3 text-xs">Preview</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Career Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your personalized step-by-step path to your target role, with milestones and timelines.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Software Engineering Path</CardTitle>
            <Badge variant="secondary">34% complete</Badge>
          </div>
        </CardHeader>
        <CardContent className="opacity-60">
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={m.title} className="flex items-center gap-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.status === 'complete' ? 'bg-success/10' :
                  m.status === 'in-progress' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {m.status === 'complete' ?
                    <CheckCircle className="h-4 w-4 text-success" /> :
                    <span className="text-xs font-mono font-semibold text-muted-foreground">{i + 1}</span>
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.duration}</p>
                </div>
                {m.status === 'in-progress' && (
                  <Badge variant="default" className="text-xs">In progress</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="border border-dashed border-border rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground">AI-generated personalized roadmaps coming in the next module.</p>
      </div>
    </div>
  );
}
