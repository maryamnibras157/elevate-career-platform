'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AdminCareerCreatePayload, AdminCareerUpdatePayload, AdminCareer } from '@/types/admin';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const careerSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  salary_estimate: z.string().optional(),
  demand_level: z.string().optional(),
  growth_outlook: z.string().optional(),
});

type CareerFormValues = z.infer<typeof careerSchema>;

interface CareerFormProps {
  initialData?: AdminCareer;
  onSubmit: (data: AdminCareerCreatePayload | AdminCareerUpdatePayload) => Promise<boolean>;
  isLoading?: boolean;
}

export default function CareerForm({ initialData, onSubmit, isLoading = false }: CareerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CareerFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      salary_estimate: initialData?.salary_estimate || '',
      demand_level: initialData?.demand_level || '',
      growth_outlook: initialData?.growth_outlook || '',
    },
  });

  const onSubmitForm = async (data: CareerFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(data);
      if (success) {
        reset(data); // Reset isDirty state
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/careers"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {initialData ? 'Edit Career' : 'Create New Career'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Career Title *</label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border rounded-md bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. Software Engineer"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={5}
                className="w-full px-3 py-2 border rounded-md bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Detailed description of the career..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Salary Estimate</label>
                <input
                  {...register('salary_estimate')}
                  className="w-full px-3 py-2 border rounded-md bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. $80,000 - $120,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Demand Level</label>
                <select
                  {...register('demand_level')}
                  className="w-full px-3 py-2 border rounded-md bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select Demand Level</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Growth Outlook</label>
              <input
                {...register('growth_outlook')}
                className="w-full px-3 py-2 border rounded-md bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. 22% expected growth by 2030"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (isDirty) {
                if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                  router.push('/admin/careers');
                }
              } else {
                router.push('/admin/careers');
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex items-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {initialData ? 'Save Changes' : 'Create Career'}
          </Button>
        </div>
      </form>
    </div>
  );
}
