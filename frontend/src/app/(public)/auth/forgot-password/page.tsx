'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
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

        {sent ? (
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-6">
              If an account exists for <strong>{getValues('email')}</strong>, you will receive a password reset link shortly.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">Return to sign in</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Reset your password</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Enter your email address and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                id="forgot-email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                id="forgot-submit"
              >
                Send reset link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
