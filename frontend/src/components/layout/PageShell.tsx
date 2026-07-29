import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageShellProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className
}: PageShellProps) {
  return (
    <div className={cn('flex flex-col min-h-0 w-full max-w-7xl mx-auto space-y-6', className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center text-sm text-muted-foreground mb-2 whitespace-nowrap overflow-x-auto hide-scrollbar">
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="mx-1 h-3.5 w-3.5 shrink-0" />}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-foreground transition-colors font-medium">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
