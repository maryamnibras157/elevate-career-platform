'use client';

import { useEffect, useState, use } from 'react';
import { adminApi } from '@/services/adminApi';
import { Notification } from '@/types/admin';
import { 
  Loader2, ArrowLeft, Clock, Users, CheckCircle2, Activity, Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
};

export default function NotificationDetailPage({ params }: { params: Promise<{ notificationId: string }> }) {
  const resolvedParams = use(params);
  const notifId = resolvedParams.notificationId;
  const [notif, setNotif] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifId]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getNotification(notifId);
      if (res.success && res.data) {
        setNotif(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notification details');
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

  if (!notif) {
    return (
      <div className="flex flex-col justify-center items-center h-screen -mt-20 text-center">
        <h2 className="text-2xl font-semibold">Notification Not Found</h2>
        <Link href="/admin/notifications">
          <Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/notifications">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{notif.title}</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {notif.id}</p>
          </div>
        </div>
        {notif.status !== 'Published' && notif.status !== 'Archived' && (
          <Link href={`/admin/notifications/${notif.id}/edit`}>
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:border-gray-700">
            <Activity className="h-5 w-5 text-blue-500" /> Read Analytics
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Read Percentage</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-4xl font-bold">{notif.read_percentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-blue-500" style={{width: `${notif.read_percentage}%`}}></div>
              </div>
            </div>
            
            <div className="pt-4 border-t dark:border-gray-700 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Users className="h-4 w-4" /> Target</p>
                <p className="text-xl font-semibold mt-1">{notif.total_recipients}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Read</p>
                <p className="text-xl font-semibold mt-1">{notif.read_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:border-gray-700">
            <Clock className="h-5 w-5 text-indigo-500" /> Lifecycle & Metadata
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="mt-1 font-medium">{notif.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Type</dt>
              <dd className="mt-1 font-medium">{notif.type}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Priority</dt>
              <dd className="mt-1 font-medium">{notif.priority}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Audience</dt>
              <dd className="mt-1 font-medium">{notif.target_audience}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Created At</dt>
              <dd className="mt-1">{formatDate(notif.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Scheduled For</dt>
              <dd className="mt-1">{formatDate(notif.scheduled_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Published At</dt>
              <dd className="mt-1">{formatDate(notif.published_at)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Message Content</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg whitespace-pre-wrap font-mono text-sm">
          {notif.message}
        </div>
      </div>
    </div>
  );
}
