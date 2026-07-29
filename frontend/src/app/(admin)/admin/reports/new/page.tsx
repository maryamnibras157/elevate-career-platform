'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { ReportCategory, ReportFormat, ReportScheduleFrequency } from '@/types/admin';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Download, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewReportPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Users');
  const [format, setFormat] = useState<ReportFormat>('CSV');
  
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [frequency, setFrequency] = useState<ReportScheduleFrequency>('Weekly');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveConfig = async () => {
    if (!name.trim()) return toast.error('Report name is required');
    
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        category,
        format,
        filters: {}, // Generic empty filters for now as they apply dynamically
        schedule: enableSchedule ? { frequency, is_active: true } : undefined
      };
      const res = await adminApi.createReportConfig(payload);
      if (res.success) {
        toast.success('Report configured successfully');
        router.push('/admin/reports');
      }
    } catch (e) {
      toast.error('Failed to configure report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportNow = async () => {
    setIsSubmitting(true);
    try {
      const blob = await adminApi.exportDynamicReport(category);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${category.toLowerCase()}_${new Date().getTime()}.csv`;
      a.click();
      toast.success('Export downloaded');
    } catch (e) {
      toast.error('Failed to export');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/reports"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Build Report</h1>
          <p className="text-sm text-gray-500">Configure parameters for a new export or scheduled report.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Configuration</h3>
          
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-medium">Report Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Weekly User Growth" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as ReportCategory)} className="w-full h-10 px-3 rounded-md border bg-transparent">
                <option value="Users">Users</option>
                <option value="Careers">Careers</option>
                <option value="Resumes">Resumes</option>
                <option value="Audit Logs">Audit Logs</option>
                <option value="Notifications">Notifications</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <select value={format} onChange={e => setFormat(e.target.value as ReportFormat)} className="w-full h-10 px-3 rounded-md border bg-transparent">
                <option value="CSV">CSV Document</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 flex items-center justify-between">
            Schedule
            <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
              <input type="checkbox" checked={enableSchedule} onChange={e => setEnableSchedule(e.target.checked)} className="rounded" />
              Enable Scheduling
            </label>
          </h3>
          
          {enableSchedule && (
            <div className="space-y-2 max-w-md p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <label className="text-sm font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as ReportScheduleFrequency)} className="w-full h-10 px-3 rounded-md border bg-transparent">
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Scheduled reports will be generated automatically and logged in the Generation History.
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={handleExportNow} disabled={isSubmitting}>
            <Download className="mr-2 h-4 w-4" /> Export Config Immediately (No Save)
          </Button>
          <Button className="bg-primary text-white" onClick={handleSaveConfig} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
