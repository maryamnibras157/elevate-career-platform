import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ELEVATE | The AI Operating System for Student Careers',
    template: '%s | ELEVATE',
  },
  description:
    'ELEVATE helps students discover careers, analyze resumes, identify skill gaps, generate career roadmaps, and improve placement readiness through explainable AI.',
  keywords: ['career', 'AI', 'students', 'resume', 'career roadmap', 'skill gap', 'placement'],
  authors: [{ name: 'ELEVATE Team' }],
  openGraph: {
    type: 'website',
    siteName: 'ELEVATE',
    title: 'ELEVATE | The AI Operating System for Student Careers',
    description: 'AI-powered career guidance platform for students.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELEVATE',
    description: 'AI-powered career guidance platform for students.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  classNames: {
                    toast: 'bg-card border border-border text-foreground shadow-lg',
                    error: 'border-destructive/30',
                    success: 'border-success/30',
                  },
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
