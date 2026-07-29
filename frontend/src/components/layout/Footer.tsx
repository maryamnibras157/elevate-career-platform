import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'AI Capabilities', href: '#ai-capabilities' },
    { label: 'FAQ', href: '#faq' },
  ],
  Platform: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Career Analyzer', href: '/dashboard' },
    { label: 'Resume Analysis', href: '/dashboard' },
    { label: 'Career Roadmap', href: '/dashboard' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact', href: '#contact' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">E</span>
              </div>
              <span className="font-semibold text-sm">ELEVATE</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              The AI operating system for student careers. Discover, plan, and accelerate your professional journey.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ELEVATE. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for students, by engineers.
          </p>
        </div>
      </div>
    </footer>
  );
}
