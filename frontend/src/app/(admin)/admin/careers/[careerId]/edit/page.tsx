'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CareerForm from '@/components/admin/careers/CareerForm';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { AdminCareerUpdatePayload, AdminCareer } from '@/types/admin';
import { Loader2 } from 'lucide-react';

export default function EditCareerPage() {
  const router = useRouter();
  const params = useParams();
  const careerId = params.careerId as string;

  const [career, setCareer] = useState<AdminCareer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSubmit = async (data: AdminCareerUpdatePayload | any) => {
    try {
      const res = await adminApi.updateCareer(careerId, data);
      if (res.success) {
        toast.success('Career updated successfully');
        router.push('/admin/careers');
        return true;
      } else {
        toast.error(res.message || 'Failed to update career');
        return false;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'An error occurred while updating career');
      return false;
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
        <p className="text-gray-500 mb-4">The career you are trying to edit does not exist.</p>
        <button 
          onClick={() => router.push('/admin/careers')}
          className="text-primary hover:underline"
        >
          Return to Careers
        </button>
      </div>
    );
  }

  return <CareerForm initialData={career} onSubmit={handleSubmit} />;
}
