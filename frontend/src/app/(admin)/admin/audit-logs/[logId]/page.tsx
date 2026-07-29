'use client';

import { useEffect, useState, use } from 'react';
import { adminApi } from '@/services/adminApi';
import { AuditLog } from '@/types/admin';
import { 
  Loader2, ArrowLeft, Shield, Clock, User, 
  Activity, CheckCircle2, AlertCircle, Terminal, EyeOff 
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const formatDateTime = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date(dateStr));
};

export default function AuditLogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
  const resolvedParams = use(params);
  const logId = resolvedParams.logId;
  const [log, setLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logId]);

  const fetchLogDetail = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogDetail(logId);
      if (res.success && res.data) {
        setLog(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audit log details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen -mt-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col justify-center items-center h-screen -mt-20 text-center">
        <Shield className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Audit Log Not Found</h2>
        <p className="text-gray-500 mt-2 mb-6">The requested audit log could not be found or you do not have permission to view it.</p>
        <Link href="/admin/audit-logs">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Audit Logs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/audit-logs">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Audit Event Details
            {log.status === 'SUCCESS' ? (
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> SUCCESS
              </span>
            ) : log.status === 'FAILED' ? (
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> FAILED
              </span>
            ) : null}
          </h1>
          <p className="text-sm text-gray-500 font-mono mt-1">ID: {log.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Event Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:border-gray-700">
            <Activity className="h-5 w-5 text-blue-500" /> Event Summary
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500 flex items-center gap-1"><Clock className="h-4 w-4" /> Timestamp</dt>
              <dd className="mt-1 text-gray-900 dark:text-gray-100 font-medium">{formatDateTime(log.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 flex items-center gap-1"><Terminal className="h-4 w-4" /> Action</dt>
              <dd className="mt-1">
                <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-mono">
                  {log.action}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Administrator Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:border-gray-700">
            <User className="h-5 w-5 text-indigo-500" /> Administrator Details
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="mt-1 text-gray-900 dark:text-gray-100 font-medium">{log.user_name || 'Unknown / System'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="mt-1 text-gray-900 dark:text-gray-100">{log.user_email || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">User ID</dt>
              <dd className="mt-1 text-gray-900 dark:text-gray-100 font-mono text-sm">{log.user_id || '-'}</dd>
            </div>
            {log.ip_address && (
              <div>
                <dt className="text-sm text-gray-500">IP Address</dt>
                <dd className="mt-1 text-gray-900 dark:text-gray-100 font-mono text-sm">{log.ip_address}</dd>
              </div>
            )}
          </dl>
        </div>

      </div>

      {/* Raw Payload Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" /> Change Summary & Request Payload
          </h3>
          <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
            <EyeOff className="h-3 w-3 mr-1" /> Sensitive Data Masked
          </div>
        </div>
        <div className="p-0 bg-gray-50 dark:bg-gray-900">
          <pre className="p-6 text-sm font-mono text-gray-800 dark:text-gray-300 overflow-x-auto">
            {JSON.stringify(log.metadata_ || {}, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Timeline View */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-purple-500" /> Event Timeline
        </h3>
        
        <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-4">
          <div className="relative">
            <div className="absolute -left-[21px] bg-white dark:bg-gray-800 rounded-full p-1 border-2 border-gray-300 dark:border-gray-600">
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
            </div>
            <div className="pl-6">
              <h4 className="text-sm font-medium">Request Received</h4>
              <p className="text-xs text-gray-500 mt-1">Action {log.action} initiated by {log.user_name || 'System'}</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[21px] bg-white dark:bg-gray-800 rounded-full p-1 border-2 border-indigo-300 dark:border-indigo-600">
              <div className="h-2 w-2 bg-indigo-500 rounded-full" />
            </div>
            <div className="pl-6">
              <h4 className="text-sm font-medium">Authorization & Validation</h4>
              <p className="text-xs text-gray-500 mt-1">Role checks passed and request context validated.</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[21px] bg-white dark:bg-gray-800 rounded-full p-1 border-2 border-blue-300 dark:border-blue-600">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
            </div>
            <div className="pl-6">
              <h4 className="text-sm font-medium">Database Operation</h4>
              <p className="text-xs text-gray-500 mt-1">
                {log.resource ? `Mutated resource: ${log.resource} ${log.resource_id ? `(${log.resource_id})` : ''}` : 'System operation executed.'}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className={`absolute -left-[21px] bg-white dark:bg-gray-800 rounded-full p-1 border-2 ${log.status === 'SUCCESS' ? 'border-green-300 dark:border-green-600' : 'border-red-300 dark:border-red-600'}`}>
              <div className={`h-2 w-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="pl-6">
              <h4 className="text-sm font-medium">Resolution</h4>
              <p className="text-xs text-gray-500 mt-1">
                {log.status === 'SUCCESS' ? 'Operation completed successfully and audit log saved.' : 'Operation failed and was safely aborted.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
