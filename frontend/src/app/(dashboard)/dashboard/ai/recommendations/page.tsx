'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RecommendationService } from '@/services/recommendation.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Map, Heart } from 'lucide-react';
import Link from 'next/link';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await RecommendationService.getRecommendations();
        if (res.success) {
          if (res.data.length === 0) {
            const toastId = toast.loading('Generating career recommendations...');
            try {
              const generated = await RecommendationService.generateRecommendations({});
              if (generated.success) {
                setRecommendations(generated.data);
                toast.success('Recommendations generated!', { id: toastId });
              } else {
                toast.error('Failed to generate recommendations', { id: toastId });
              }
            } catch (err) {
              toast.error('Error generating recommendations', { id: toastId });
            }
          } else {
            setRecommendations(res.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Career Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Careers uniquely matched to your profile, skills, and interests.
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, i) => (
            <Card key={rec.id || i} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                    <Sparkles className="w-3 h-3" />
                    {rec.match_percentage}% Match
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="mt-2 text-xl">{rec.career?.title || 'Unknown Career'}</CardTitle>
                <CardDescription>Confidence: {(rec.confidence_score * 100).toFixed(0)}%</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">{rec.why_matches}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Missing Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.missing_skills?.map((s: string) => (
                      <Badge key={s} variant="outline" className="text-xs font-normal">{s}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/dashboard/ai/roadmap?career=${rec.career_id}`} className="flex-1">
                  <Button className="w-full text-xs h-9">
                    <Map className="w-3.5 h-3.5 mr-1.5" />
                    View Roadmap
                  </Button>
                </Link>
                <Link href={`/dashboard/careers/compare`} className="flex-1">
                  <Button variant="outline" className="w-full text-xs h-9">
                    Compare
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
