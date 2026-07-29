import type { Metadata } from 'next';
import { FileText, Upload, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Resume Analysis' };

export default function ResumeAnalysisPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Badge variant="outline" className="mb-3 text-xs">Coming in next module</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Resume Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your resume to receive ATS scoring, detailed feedback, and improvement recommendations.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 hover:border-primary/40 transition-colors">
        <CardContent className="p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold mb-1">Upload your resume</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Supports PDF, DOCX, and TXT formats. Max 10MB.
          </p>
          <Button size="sm" disabled>Upload resume</Button>
          <p className="text-xs text-muted-foreground mt-3">Resume analysis coming in the next module.</p>
        </CardContent>
      </Card>

      {/* Preview of capabilities */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, title: 'ATS Score', desc: 'See how well your resume passes Applicant Tracking Systems' },
          { icon: CheckCircle, title: 'Strengths', desc: 'Identify what you are doing well relative to your target roles' },
          { icon: AlertCircle, title: 'Improvements', desc: 'Get specific, actionable suggestions to strengthen your resume' },
        ].map((item) => (
          <Card key={item.title} className="opacity-60">
            <CardContent className="p-4">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mb-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
