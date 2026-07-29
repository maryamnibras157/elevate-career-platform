'use client';

import { useRouter } from 'next/navigation';
import CareerForm from '@/components/admin/careers/CareerForm';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { AdminCareerCreatePayload } from '@/types/admin';

export default function NewCareerPage() {
  const router = useRouter();

  const handleSubmit = async (data: AdminCareerCreatePayload | any) => {
    try {
      const res = await adminApi.createCareer(data);
      if (res.success) {
        toast.success('Career created successfully');
        router.push('/admin/careers');
        return true;
      } else {
        toast.error(res.message || 'Failed to create career');
        return false;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'An error occurred while creating career');
      return false;
    }
  };

  return <CareerForm onSubmit={handleSubmit} />;
}
