import type { Metadata } from 'next';
import { Target, BrainCircuit, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Career Discovery' };

export default function CareerDiscoveryPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Badge variant="outline" className="mb-3 text-xs">Coming in next module</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Career Discovery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Our AI analyzes your profile and surfaces career paths aligned with your unique skills, interests, and goals.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 opacity-60">
        {[
          { icon: BrainCircuit, title: 'AI Profile Analysis', desc: 'Deep analysis of your skills and interests' },
          { icon: Target, title: 'Role Matching', desc: 'Semantically matched career paths from your profile' },
          { icon: Users, title: 'Peer Benchmarking', desc: 'Compare against students with similar backgrounds' },
          { icon: TrendingUp, title: 'Market Demand', desc: 'Real-time market demand signals for each career' },
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="p-5">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mb-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border border-dashed border-border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">Career discovery engine launching in the next module.</p>
      </div>
    </div>
  );
}
