'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { AdminResumeAnalysis } from '@/types/admin';
import { useAdminStore } from '@/store/adminStore';
import { Loader2, ArrowLeft, Trash2, FileText, CheckCircle, XCircle, Award, Target, User, Lightbulb, Map } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ResumeAnalysisDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params.analysisId as string;
  const { hasPermission } = useAdminStore();
  const canDelete = hasPermission('VIEW_RESUME_STATS'); // Used VIEW_RESUME_STATS since DELETE_RESUME_ANALYSIS is not an enum in DB

  const [analysis, setAnalysis] = useState<AdminResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await adminApi.getResumeAnalysisById(analysisId);
        if (res.success) {
          setAnalysis(res.data);
        } else {
          toast.error(res.message || 'Failed to fetch analysis');
          router.push('/admin/resume-statistics');
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while fetching analysis');
        router.push('/admin/resume-statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (analysisId) {
      fetchAnalysis();
    }
  }, [analysisId, router]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await adminApi.deleteResumeAnalysis(analysisId);
      if (res.success) {
        toast.success('Analysis deleted successfully');
        router.push('/admin/resume-statistics');
      } else {
        toast.error(res.message || 'Failed to delete analysis');
        setIsDeleting(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'An error occurred while deleting analysis');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col text-center">
        <h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
        <p className="text-gray-500 mb-4">The resume analysis you are trying to view does not exist.</p>
        <button 
          onClick={() => router.push('/admin/resume-statistics')}
          className="text-primary hover:underline"
        >
          Return to Statistics
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/resume-statistics"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resume Analysis Details</h1>
            <p className="text-muted-foreground text-gray-500 mt-1">
              Analyzed on {new Date(analysis.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canDelete && (
            <Button 
              variant="danger" 
              className="flex items-center gap-2"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Analysis
            </Button>
          )}
        </div>
      </div>

      {/* User Info & Summary Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b pb-4 dark:border-gray-700">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-lg">{analysis.user_name || 'Unknown User'}</p>
              <p className="text-sm text-gray-500">{analysis.user_email || 'No email provided'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">User ID</p>
            <p className="font-mono text-xs break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">{analysis.user_id}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
            <Award className="h-4 w-4" /> Resume Score
          </h3>
          {analysis.resume_score ? (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-4xl font-bold">{analysis.resume_score.toFixed(0)}</span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${analysis.resume_score >= 80 ? 'bg-green-500' : analysis.resume_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${analysis.resume_score}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic">No score calculated</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
            <Target className="h-4 w-4" /> ATS Score
          </h3>
          {analysis.ats_score ? (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-4xl font-bold">{analysis.ats_score.toFixed(0)}</span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${analysis.ats_score >= 80 ? 'bg-green-500' : analysis.ats_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${analysis.ats_score}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic">No score calculated</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Identified Strengths
            </h2>
            {analysis.strengths && analysis.strengths.length > 0 ? (
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No strengths identified.</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-700">
              <XCircle className="h-5 w-5 text-red-500" />
              Areas for Improvement
            </h2>
            {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No weaknesses identified.</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Missing Keywords</h2>
            {analysis.missing_keywords && analysis.missing_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No missing keywords identified.</p>
            )}
          </div>
        </div>

        {/* Extracted Metadata */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-700">
              <FileText className="h-5 w-5 text-blue-500" />
              Extracted Skills
            </h2>
            {analysis.skills && analysis.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No skills extracted.</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Experience Summary</h2>
            {analysis.experience && analysis.experience.length > 0 ? (
              <div className="space-y-3">
                {analysis.experience.map((exp: any, i) => (
                  <div key={i} className="text-sm border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                    <p className="font-medium">{exp.title || 'Unknown Title'}</p>
                    <p className="text-gray-500">{exp.company || 'Unknown Company'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No experience extracted.</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Education Summary</h2>
            {analysis.education && analysis.education.length > 0 ? (
              <div className="space-y-3">
                {analysis.education.map((edu: any, i) => (
                  <div key={i} className="text-sm border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                    <p className="font-medium">{edu.degree || 'Unknown Degree'}</p>
                    <p className="text-gray-500">{edu.institution || 'Unknown Institution'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No education extracted.</p>
            )}
          </div>
        </div>
      </div>

      {/* Linked AI Recommendations & Roadmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-700">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Recommendations (User History)
          </h2>
          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            <div className="space-y-4">
              {analysis.recommendations.map((rec: any, i) => (
                <div key={i} className="text-sm p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-base">{rec.career_title}</p>
                    <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-medium">
                      {rec.match_percentage}% Match
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{rec.why_matches}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Lightbulb className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p>No AI recommendations generated yet.</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-700">
            <Map className="h-5 w-5 text-purple-500" />
            Roadmaps (User History)
          </h2>
          {analysis.roadmaps && analysis.roadmaps.length > 0 ? (
            <div className="space-y-4">
              {analysis.roadmaps.map((rm: any, i) => (
                <div key={i} className="text-sm p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="font-semibold text-base">{rm.title}</p>
                  <p className="text-gray-500 mt-1">Target: {rm.career_title}</p>
                  {rm.current_level && (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs rounded-full">
                      Level: {rm.current_level}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Map className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p>No roadmaps generated yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
