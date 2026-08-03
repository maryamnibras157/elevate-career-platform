'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bookmark,
  BriefcaseBusiness,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { CareerService } from '@/services/career.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Skill {
  id?: string;
  name: string;
  category?: string;
}

interface Career {
  id: string;
  title: string;
  description: string;
  salary_estimate?: string | null;
  demand_level?: string | null;
  growth_outlook?: string | null;
  skills?: Skill[];
}

interface CareersApiResponse {
  success?: boolean;
  message?: string;
  data?: Career[];
}

function extractCareers(response: CareersApiResponse | Career[]): Career[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response?.data) ? response.data : [];
}

export default function CareerDiscoveryClient() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savingCareerId, setSavingCareerId] = useState<string | null>(null);
  const [savedCareerIds, setSavedCareerIds] = useState<Set<string>>(
    () => new Set()
  );

  const loadCareers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await CareerService.getCareers();
      const careerData = extractCareers(response);

      setCareers(careerData);
    } catch (err) {
      console.error('Failed to load careers:', err);
      setError(
        'We could not load career paths. Please wait a moment and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCareer = async (careerId: string) => {
    try {
      setSavingCareerId(careerId);
      setError(null);

      await CareerService.toggleSaveCareer(careerId);

      setSavedCareerIds((current) => {
        const updated = new Set(current);

        if (updated.has(careerId)) {
          updated.delete(careerId);
        } else {
          updated.add(careerId);
        }

        return updated;
      });
    } catch (err) {
      console.error('Failed to save career:', err);
      setError('We could not update the saved career. Please try again.');
    } finally {
      setSavingCareerId(null);
    }
  };

  useEffect(() => {
    void loadCareers();
  }, [loadCareers]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            Career explorer
          </Badge>

          <h1 className="text-2xl font-bold tracking-tight">
            Career Discovery
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Explore career paths, required skills, earning potential, market
            demand, and growth outlook.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadCareers()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-2/3 rounded bg-muted" />
                <div className="h-4 w-1/3 rounded bg-muted" />
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="h-8 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>

            <Button type="button" onClick={() => void loadCareers()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && careers.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

            <h2 className="font-semibold">No career paths available</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Career records have not been added to the database yet.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && careers.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {careers.map((career) => (
              <Card
                key={career.id}
                className="flex h-full flex-col transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BriefcaseBusiness className="h-5 w-5 text-primary" />
                    </div>

                    {career.demand_level && (
                      <Badge
                        variant={
                          career.demand_level.toLowerCase() === 'high'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {career.demand_level} demand
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-lg">
                    {career.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col space-y-5">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {career.description}
                  </p>

                  <div className="space-y-3">
                    {career.salary_estimate && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Salary estimate
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {career.salary_estimate}
                        </p>
                      </div>
                    )}

                    {career.growth_outlook && (
                      <div className="flex gap-2">
                        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Growth outlook
                          </p>

                          <p className="mt-1 text-sm">
                            {career.growth_outlook}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {career.skills && career.skills.length > 0 && (
                    <div className="mt-auto border-t pt-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Key skills
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {career.skills.map((skill) => (
                          <Badge
                            key={
                              skill.id ??
                              `${career.id}-${skill.name}`
                            }
                            variant="secondary"
                          >
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant={
                      savedCareerIds.has(career.id)
                        ? 'secondary'
                        : 'outline'
                    }
                    className="mt-4 w-full"
                    disabled={savingCareerId === career.id}
                    onClick={() => void saveCareer(career.id)}
                  >
                    <Bookmark
                      className={`mr-2 h-4 w-4 ${
                        savedCareerIds.has(career.id)
                          ? 'fill-current'
                          : ''
                      }`}
                    />

                    {savingCareerId === career.id
                      ? 'Updating...'
                      : savedCareerIds.has(career.id)
                        ? 'Saved'
                        : 'Save career'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Showing {careers.length} available career
            {careers.length === 1 ? '' : 's'}.
          </p>
        </>
      )}
    </div>
  );
}
