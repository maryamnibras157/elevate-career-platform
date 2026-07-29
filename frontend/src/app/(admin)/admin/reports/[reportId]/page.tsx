'use client';

import { useEffect, useState, use } from 'react';
import { adminApi } from '@/services/adminApi';
import { ReportConfigOut } from '@/types/admin';
import { Loader2, ArrowLeft, Download, Calendar, Settings, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
};

export default function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const resolvedParams = use(params);
  const configId = resolvedParams.reportId;
  const router = useRouter();
  
  const [config, setConfig] = useState<ReportConfigOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configId]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getReportConfig(configId);
      if (res.success && res.data) {
        setConfig(res.data);
      }
    } catch (err) {
      toast.error('Failed to load report details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await adminApi.downloadConfiguredReport(configId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${config?.category.toLowerCase()}_${new Date().getTime()}.csv`;
      a.click();
      toast.success('Report downloaded successfully');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      await adminApi.deleteReportConfig(configId);
      toast.success('Deleted successfully');
      router.push('/admin/reports');
    } catch {
      toast.error('Failed to delete report config');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen -mt-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col justify-center items-center h-screen -mt-20 text-center">
        <h2 className="text-2xl font-semibold">Report Not Found</h2>
        <Link href="/admin/reports">
          <Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/reports">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{config.name}</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {config.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Config
          </Button>
          <Button className="bg-primary text-white" onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Generate & Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:border-gray-700">
            <Settings className="h-5 w-5 text-blue-500" /> Configuration Details
          </h3>
          <dl className="grid grid-cols-1 gap-y-4">
            <div>
              <dt className="text-sm text-gray-500">Target Category</dt>
              <dd className="mt-1 font-medium bg-gray-100 dark:bg-gray-700 w-max px-2.5 py-1 rounded-md text-sm">{config.category}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Output Format</dt>
              <dd className="mt-1 font-medium">{config.format}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Created At</dt>
              <dd className="mt-1">{formatDate(config.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Last Updated</dt>
              <dd className="mt-1">{formatDate(config.updated_at)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:border-gray-700">
            <Clock className="h-5 w-5 text-indigo-500" /> Schedule Status
          </h3>
          {config.schedule ? (
            <dl className="grid grid-cols-1 gap-y-4">
              <div>
                <dt className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Frequency</dt>
                <dd className="mt-1 font-medium">{config.schedule.frequency}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="mt-1 font-medium">
                  {config.schedule.is_active ? (
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md text-xs">Active</span>
                  ) : (
                    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md text-xs">Paused</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Next Scheduled Run</dt>
                <dd className="mt-1">{formatDate(config.schedule.next_run_at)}</dd>
              </div>
            </dl>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center text-gray-500 pb-12">
              <Calendar className="h-8 w-8 mb-2 opacity-50" />
              <p>No automatic schedule configured.</p>
              <p className="text-sm mt-1">This report is run on-demand only.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
