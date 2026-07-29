'use client';

import { useState, useEffect } from 'react';
import { CareerService } from '@/services/career.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip
} from 'recharts';
import Link from 'next/link';

export default function CompareCareersPage() {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [career1Id, setCareer1Id] = useState<string>('');
  const [career2Id, setCareer2Id] = useState<string>('');

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await CareerService.getCareers();
        if (res.success && res.data.length >= 2) {
          setCareers(res.data);
          setCareer1Id(res.data[0].id);
          setCareer2Id(res.data[1].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const c1Data = careers.find(c => c.id === career1Id);
  const c2Data = careers.find(c => c.id === career2Id);

  // Generate dynamic chart data based on mock logic to map DB fields to numerical values
  const getScore = (val: string) => {
    if (!val) return 50;
    const lower = val.toLowerCase();
    if (lower.includes('high') || lower.includes('faster')) return 95;
    if (lower.includes('medium') || lower.includes('average')) return 75;
    return 60;
  };

  const getSalaryScore = (salary: string) => {
    if (!salary) return 80;
    const num = parseInt(salary.replace(/\D/g, ''));
    if (num > 130000) return 140;
    if (num > 100000) return 120;
    return 90;
  };

  const comparisonData = c1Data && c2Data ? [
    { subject: 'Salary Potential', career1: getSalaryScore(c1Data.salary_estimate), career2: getSalaryScore(c2Data.salary_estimate), fullMark: 150 },
    { subject: 'Growth Outlook', career1: getScore(c1Data.growth_outlook), career2: getScore(c2Data.growth_outlook), fullMark: 100 },
    { subject: 'Demand', career1: getScore(c1Data.demand_level), career2: getScore(c2Data.demand_level), fullMark: 100 },
    { subject: 'Skills Req', career1: c1Data.skills?.length * 15 || 50, career2: c2Data.skills?.length * 15 || 50, fullMark: 100 },
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare Careers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Evaluate two career paths side-by-side to make an informed decision.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : careers.length < 2 ? (
        <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
          Not enough careers in the database to compare.
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-1.5 block">First Career</label>
              <Select value={career1Id} onValueChange={setCareer1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select career..." />
                </SelectTrigger>
                <SelectContent>
                  {careers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="shrink-0 mt-6 hidden md:block">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-1.5 block">Second Career</label>
              <Select value={career2Id} onValueChange={setCareer2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select career..." />
                </SelectTrigger>
                <SelectContent>
                  {careers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {c1Data && c2Data && (
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Metric Comparison</CardTitle>
                  <CardDescription>Visual radar chart comparing key aspects</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={comparisonData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar name={c1Data.title} dataKey="career1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      <Radar name={c2Data.title} dataKey="career2" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Side-by-Side Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Feature</th>
                          <th className="px-4 py-3 text-primary font-bold">{c1Data.title}</th>
                          <th className="px-4 py-3 text-accent font-bold rounded-tr-lg">{c2Data.title}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-4 font-medium">Expected Salary</td>
                          <td className="px-4 py-4">{c1Data.salary_estimate || 'N/A'}</td>
                          <td className="px-4 py-4">{c2Data.salary_estimate || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-4 font-medium">Growth Outlook</td>
                          <td className="px-4 py-4">{c1Data.growth_outlook || 'N/A'}</td>
                          <td className="px-4 py-4">{c2Data.growth_outlook || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-4 font-medium">Demand Level</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary">
                              {c1Data.demand_level?.includes('High') ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                              {c1Data.demand_level || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary">
                              {c2Data.demand_level?.includes('High') ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                              {c2Data.demand_level || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button asChild className="flex-1 text-xs">
                      <Link href={`/dashboard/ai/roadmap?career=${c1Data.id}`}>
                        Generate Roadmap for {c1Data.title.split(' ')[0]}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 text-xs border-accent text-accent hover:bg-accent/10 hover:text-accent">
                      <Link href={`/dashboard/ai/roadmap?career=${c2Data.id}`}>
                        Generate Roadmap for {c2Data.title.split(' ')[0]}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
