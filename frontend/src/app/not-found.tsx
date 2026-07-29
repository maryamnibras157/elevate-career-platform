import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-8">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <div className="max-w-md">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">404 Error</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Page not found</h1>
        <p className="text-base text-muted-foreground mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or doesn&apos;t exist.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
