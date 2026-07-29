'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { SystemInfo } from '@/types/admin';
import { Loader2, Server, Database, Code, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemInfoPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const res = await adminApi.getSystemInfo();
      if (res.success) {
        setInfo(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !info) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStatus = (status: string) => {
    if (status === 'Healthy') {
      return (
        <div className="flex items-center gap-1.5 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Healthy</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">{status}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
        <div className="p-6 border-b dark:border-gray-700 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">System Diagnostics</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time platform environment and versioning information.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
              <Code className="h-4 w-4 text-gray-500" /> Application Stack
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Environment</dt>
                <dd className="font-medium capitalize">{info.environment}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">App Version</dt>
                <dd className="font-mono">{info.app_version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Next.js</dt>
                <dd className="font-mono">{info.nextjs_version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">FastAPI</dt>
                <dd className="font-mono">{info.fastapi_version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Python</dt>
                <dd className="font-mono">{info.python_version}</dd>
              </div>
            </dl>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
              <Database className="h-4 w-4 text-gray-500" /> Infrastructure
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">PostgreSQL DB</dt>
                <dd>{renderStatus(info.database_status)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">DB Version</dt>
                <dd className="font-mono">{info.database_version}</dd>
              </div>
              <div className="flex justify-between items-center pt-2">
                <dt className="text-gray-500">Redis Cache</dt>
                <dd>{renderStatus(info.redis_status)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Redis Version</dt>
                <dd className="font-mono">{info.redis_version}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
