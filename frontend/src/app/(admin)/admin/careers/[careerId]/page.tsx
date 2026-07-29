'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { AdminCareer } from '@/types/admin';
import { Loader2, ArrowLeft, Edit, Trash2, Briefcase, Calendar, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';

export default function CareerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const careerId = params.careerId as string;
  const { hasPermission } = useAdminStore();
  
  const canUpdate = hasPermission('UPDATE_CAREERS');
  const canDelete = hasPermission('DELETE_CAREERS');

  const [career, setCareer] = useState<AdminCareer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const res = await adminApi.getCareerById(careerId);
        if (res.success) {
          setCareer(res.data);
        } else {
          toast.error(res.message || 'Failed to fetch career');
          router.push('/admin/careers');
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while fetching career');
        router.push('/admin/careers');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (careerId) {
      fetchCareer();
    }
  }, [careerId, router]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this career? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await adminApi.deleteCareer(careerId);
      if (res.success) {
        toast.success('Career deleted successfully');
        router.push('/admin/careers');
      } else {
        toast.error(res.message || 'Failed to delete career');
        setIsDeleting(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'An error occurred while deleting career');
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

  if (!career) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col text-center">
        <h2 className="text-xl font-semibold mb-2">Career Not Found</h2>
        <p className="text-gray-500 mb-4">The career you are trying to view does not exist.</p>
        <button 
          onClick={() => router.push('/admin/careers')}
          className="text-primary hover:underline"
        >
          Return to Careers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/careers"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{career.title}</h1>
            <p className="text-muted-foreground text-gray-500 mt-1">Career Details and Information</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Link href={`/admin/careers/${career.id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
          
          {canDelete && (
            <Button 
              variant="danger" 
              className="flex items-center gap-2"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Overview
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {career.description ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{career.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description provided.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0 mt-0.5">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Demand Level</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{career.demand_level || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0 mt-0.5">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Salary Estimate</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{career.salary_estimate || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0 mt-0.5">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Growth Outlook</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{career.growth_outlook || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 shrink-0 mt-0.5">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Created Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(career.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 shrink-0 mt-0.5">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(career.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
