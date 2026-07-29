'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Send, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewNotificationPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Information');
  const [priority, setPriority] = useState('Normal');
  const [targetAudience, setTargetAudience] = useState('All Users');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDraft = async () => {
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await adminApi.createNotification({ title, message, type, priority, target_audience: targetAudience });
      if (res.success) {
        toast.success('Draft saved');
        router.push(`/admin/notifications`);
      }
    } catch (e) {
      toast.error('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !message) return toast.error('Title and message required');
    if (!confirm('Are you sure you want to publish this to ' + targetAudience + '?')) return;
    setIsSubmitting(true);
    try {
      const res = await adminApi.createNotification({ title, message, type, priority, target_audience: targetAudience });
      if (res.success && res.data) {
        await adminApi.publishNotification(res.data.id);
        toast.success('Notification published');
        router.push(`/admin/notifications`);
      }
    } catch (e) {
      toast.error('Failed to publish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    if (!title || !message || !scheduledAt) return toast.error('Title, message, and scheduled time required');
    const d = new Date(scheduledAt);
    if (d <= new Date()) return toast.error('Schedule time must be in the future');
    
    setIsSubmitting(true);
    try {
      const res = await adminApi.createNotification({ title, message, type, priority, target_audience: targetAudience, scheduled_at: new Date(scheduledAt).toISOString() });
      if (res.success && res.data) {
        await adminApi.scheduleNotification(res.data.id, new Date(scheduledAt).toISOString());
        toast.success('Notification scheduled');
        router.push(`/admin/notifications`);
      }
    } catch (e) {
      toast.error('Failed to schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/notifications"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">New Notification</h1>
          <p className="text-sm text-gray-500">Create a new announcement</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification Title" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-transparent">
              <option value="Information">Information</option>
              <option value="Warning">Warning</option>
              <option value="Success">Success</option>
              <option value="Error">Error</option>
              <option value="Maintenance">Maintenance</option>
              <option value="System Update">System Update</option>
              <option value="Feature Release">Feature Release</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-transparent">
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-transparent">
              <option value="All Users">All Users</option>
              <option value="Verified Users">Verified Users</option>
              <option value="Admins">Admins</option>
              <option value="Students">Students</option>
              <option value="Professionals">Professionals</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message (Markdown Supported)</label>
          <textarea 
            value={message} onChange={e => setMessage(e.target.value)}
            className="w-full min-h-[200px] p-3 rounded-md border bg-transparent font-mono text-sm"
            placeholder="Type your message here..."
          />
        </div>

        <div className="pt-6 border-t flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> Save as Draft</Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 items-center">
              <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-auto" />
              <Button variant="secondary" onClick={handleSchedule} disabled={isSubmitting || !scheduledAt}><Calendar className="mr-2 h-4 w-4" /> Schedule</Button>
            </div>
            <Button className="bg-primary text-white" onClick={handlePublish} disabled={isSubmitting}><Send className="mr-2 h-4 w-4" /> Publish Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
