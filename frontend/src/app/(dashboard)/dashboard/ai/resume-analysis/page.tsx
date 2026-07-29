'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ResumeService } from '@/services/resume.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowUpCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

export default function ResumeAnalysisPage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await ResumeService.getLatestAnalysis();
        if (res.success && res.data) {
          setAnalysis(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      const toastId = toast.loading('Uploading and analyzing resume...');
      try {
        const res = await ResumeService.analyzeResume(e.target.files[0]);
        if (res.success) {
          setAnalysis(res.data);
          toast.success('Resume analyzed successfully', { id: toastId });
        } else {
          toast.error(res.message || 'Failed to analyze resume', { id: toastId });
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred during upload', { id: toastId });
      } finally {
        setLoading(false);
      }
    }
  };

  const chartData = analysis ? [
    { name: 'Resume Score', score: analysis.resume_score },
    { name: 'ATS Match', score: analysis.ats_score }
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Resume Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your resume to get instant AI-powered feedback and ATS scoring.
          </p>
        </div>
        <div>
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
          />
          <label htmlFor="resume-upload">
            <Button asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload New Resume
              </span>
            </Button>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-primary/20">
              <CardHeader>
                <CardTitle>Scores</CardTitle>
                <CardDescription>Your current resume performance</CardDescription>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                    <RechartsTooltip 
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px' }}
                    />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Extracted Information</CardTitle>
                <CardDescription>What our AI parsed from your document</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Detected Skills ({analysis.skills?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skills?.map((s: string) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missing_keywords?.map((k: string) => (
                        <Badge key={k} variant="outline" className="text-destructive border-destructive/30">{k}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Suggested Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.suggested_improvements?.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowUpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="py-12 border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No resume analyzed yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Upload your latest resume to get a detailed AI analysis, ATS score, and tailored improvement suggestions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
