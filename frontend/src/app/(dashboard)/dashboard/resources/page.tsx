import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Resources' };

const categories = [
  { title: 'Online Courses', count: '2,400+ resources' },
  { title: 'Certifications', count: '180+ paths' },
  { title: 'Practice Projects', count: '320+ ideas' },
  { title: 'Interview Prep', count: '850+ questions' },
];

export default function ResourcesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Badge variant="outline" className="mb-3 text-xs">Coming in next module</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated courses, certifications, and projects tailored to your skill gaps.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-60">
        {categories.map((cat) => (
          <Card key={cat.title}>
            <CardContent className="p-5">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mb-3">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">{cat.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{cat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border border-dashed border-border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">Personalized resource curation coming in the next module.</p>
      </div>
    </div>
  );
}
