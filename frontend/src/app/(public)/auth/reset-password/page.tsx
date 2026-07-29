'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';

const resetSchema = z.object({
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/\d/, 'Must contain a number')
    .regex(/[@$!%*?&_#^~-]/, 'Must contain a special character'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const password = watch('new_password', '');
  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /\d/.test(password) },
    { label: 'One special character', valid: /[@$!%*?&_#^~-]/.test(password) },
  ];

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast.error('Reset token is missing from URL.');
      return;
    }

    try {
      await authService.resetPassword({ token, new_password: data.new_password });
      toast.success('Password reset successfully. You can now sign in.');
      router.push('/auth/login');
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-sm">ELEVATE</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-1">Set new password</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Create a strong password for your account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Input
              id="new-password"
              label="New password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.new_password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('new_password')}
            />
            {password && (
              <div className="mt-2 space-y-1">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-1.5">
                    <div className={`h-3 w-3 rounded-full flex items-center justify-center ${check.valid ? 'bg-success/10' : 'bg-muted'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${check.valid ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                    </div>
                    <span className={`text-xs ${check.valid ? 'text-success' : 'text-muted-foreground'}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            id="confirm-password"
            label="Confirm new password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            autoComplete="new-password"
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            id="reset-submit"
          >
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
