'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Send, Calendar, Archive } from 'lucide-react';
import Link from 'next/link';

export default function EditNotificationPage({ params }: { params: Promise<{ notificationId: string }> }) {
  const resolvedParams = use(params);
  const notifId = resolvedParams.notificationId;
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Information');
  const [priority, setPriority] = useState('Normal');
  const [targetAudience, setTargetAudience] = useState('All Users');
  const [scheduledAt, setScheduledAt] = useState('');
  const [status, setStatus] = useState('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifId]);

  const fetchNotification = async () => {
    try {
      const res = await adminApi.getNotification(notifId);
      if (res.success && res.data) {
        setTitle(res.data.title);
        setMessage(res.data.message);
        setType(res.data.type);
        setPriority(res.data.priority);
        setTargetAudience(res.data.target_audience);
        setStatus(res.data.status);
        if (res.data.scheduled_at) {
          setScheduledAt(new Date(res.data.scheduled_at).toISOString().slice(0, 16));
        }
      }
    } catch (e) {
      toast.error('Failed to load notification');
    }
  };

  const handleUpdate = async () => {
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await adminApi.updateNotification(notifId, { title, message, type, priority, target_audience: targetAudience });
      if (res.success) {
        toast.success('Notification updated');
        router.push(`/admin/notifications`);
      }
    } catch (e) {
      toast.error('Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this to ' + targetAudience + '?')) return;
    setIsSubmitting(true);
    try {
      await adminApi.publishNotification(notifId);
      toast.success('Notification published');
      router.push(`/admin/notifications`);
    } catch (e) {
      toast.error('Failed to publish');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this notification?')) return;
    setIsSubmitting(true);
    try {
      await adminApi.archiveNotification(notifId);
      toast.success('Notification archived');
      router.push(`/admin/notifications`);
    } catch (e) {
      toast.error('Failed to archive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = status === 'Published' || status === 'Archived';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/notifications"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Notification</h1>
          <p className="text-sm text-gray-500">Status: {status}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} disabled={isReadOnly} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} disabled={isReadOnly} className="w-full h-10 px-3 rounded-md border bg-transparent">
              <option value="Information">Information</option>
              <option value="Warning">Warning</option>
              <option value="Success">Success</option>
              <option value="Error">Error</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} disabled={isReadOnly} className="w-full h-10 px-3 rounded-md border bg-transparent">
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} disabled={isReadOnly} className="w-full h-10 px-3 rounded-md border bg-transparent">
              <option value="All Users">All Users</option>
              <option value="Verified Users">Verified Users</option>
              <option value="Admins">Admins</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <textarea 
            value={message} onChange={e => setMessage(e.target.value)} disabled={isReadOnly}
            className="w-full min-h-[200px] p-3 rounded-md border bg-transparent font-mono text-sm"
          />
        </div>

        {!isReadOnly && (
          <div className="pt-6 border-t flex flex-col sm:flex-row justify-between gap-4">
            <Button variant="outline" onClick={handleUpdate} disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Updates</Button>
            <Button className="bg-primary text-white" onClick={handlePublish} disabled={isSubmitting}><Send className="mr-2 h-4 w-4" /> Publish Now</Button>
          </div>
        )}
        
        {isReadOnly && status !== 'Archived' && (
          <div className="pt-6 border-t flex justify-end">
            <Button variant="danger" onClick={handleArchive} disabled={isSubmitting}><Archive className="mr-2 h-4 w-4" /> Archive</Button>
          </div>
        )}
      </div>
    </div>
  );
}
