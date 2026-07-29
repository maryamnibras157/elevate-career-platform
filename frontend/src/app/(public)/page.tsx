import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, BarChart3, BookOpen, BrainCircuit, CheckCircle,
  ChevronDown, FileText, GraduationCap, Map, Shield, Target,
  TrendingUp, Users, Zap, Star, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'ELEVATE — The AI Operating System for Student Careers',
  description:
    'ELEVATE helps students discover careers, analyze resumes, identify skill gaps, generate career roadmaps, and improve placement readiness through explainable AI.',
};

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Career Discovery',
    description:
      'Our AI analyzes your skills, interests, and academic background to surface career paths aligned with your unique profile.',
  },
  {
    icon: FileText,
    title: 'Resume Intelligence',
    description:
      'Upload your resume and receive a detailed analysis with actionable feedback, ATS score, and improvement recommendations.',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    description:
      'Identify exactly which skills you are missing for your target roles and get a prioritized learning plan.',
  },
  {
    icon: Map,
    title: 'Career Roadmaps',
    description:
      'AI-generated, step-by-step roadmaps from your current position to your target role, with milestones and timelines.',
  },
  {
    icon: BarChart3,
    title: 'Placement Analytics',
    description:
      'Track your placement readiness score over time and benchmark against successful candidates in your field.',
  },
  {
    icon: BookOpen,
    title: 'Curated Resources',
    description:
      'Personalized course recommendations, certifications, and projects tailored to close your skill gaps faster.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create your profile',
    description:
      'Tell us about your education, skills, interests, and career goals. The more context you provide, the better our AI can serve you.',
  },
  {
    step: '02',
    title: 'Upload your resume',
    description:
      'Our AI parses and analyzes your resume, extracting skills, experience, and identifying gaps relative to your target roles.',
  },
  {
    step: '03',
    title: 'Receive your roadmap',
    description:
      'Get a personalized, explainable career roadmap with concrete actions, timelines, and resources to reach your goals.',
  },
  {
    step: '04',
    title: 'Track and improve',
    description:
      'Monitor your progress, update your skills, and watch your placement readiness score rise over time.',
  },
];

const aiCapabilities = [
  { label: 'Natural Language Resume Parsing', description: 'Extracts structured data from any resume format' },
  { label: 'Career Path Prediction', description: 'Predicts career trajectories based on profile similarity' },
  { label: 'Explainable Recommendations', description: 'Every recommendation comes with a clear rationale' },
  { label: 'Skill Graph Analysis', description: 'Maps relationships between skills and career outcomes' },
  { label: 'Semantic Job Matching', description: 'Matches profiles to roles using semantic similarity' },
  { label: 'Continuous Learning', description: 'Models improve with platform usage and outcomes data' },
];

const faqs = [
  {
    question: 'Who is ELEVATE designed for?',
    answer:
      'ELEVATE is designed for students at any stage — from first-year undergraduates exploring options to final-year students preparing for placements. It is also useful for recent graduates navigating their early careers.',
  },
  {
    question: 'How does the AI generate career recommendations?',
    answer:
      'Our system uses a combination of semantic skill matching, career graph analysis, and collaborative filtering based on anonymized data from users with similar profiles and successful outcomes.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. All data is encrypted at rest and in transit. We do not sell or share your personal information. You retain full ownership of your data and can delete it at any time.',
  },
  {
    question: 'Does ELEVATE replace career counselors?',
    answer:
      'No. ELEVATE is designed to augment, not replace, human guidance. Think of it as a data-driven assistant that helps you make more informed decisions — ideally used alongside counselors and mentors.',
  },
  {
    question: 'How accurate are the skill gap analyses?',
    answer:
      'Skill gap analyses are derived from real job description data and updated regularly. Accuracy improves the more context you provide about your target roles and current skills.',
  },
];

const stats = [
  { value: '50K+', label: 'Students served' },
  { value: '200+', label: 'Career paths mapped' },
  { value: '94%', label: 'Satisfaction rate' },
  { value: '3.2x', label: 'Faster to first offer' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="page-container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 text-xs">
              Now with AI-powered career roadmaps
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              The AI operating system
              <br />
              <span className="text-primary">for student careers</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              ELEVATE helps students discover careers, analyze resumes, identify skill gaps, and generate personalized roadmaps — powered by explainable AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/register">
                <Button size="xl" id="hero-cta-primary">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="xl" variant="outline" id="hero-cta-secondary">
                  See how it works
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success" /> Free to get started
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success" /> Data encrypted and private
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-20 border border-border rounded-xl bg-card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.value} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-padding border-t border-border bg-card/50">
        <div className="page-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs">Platform features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to navigate your career
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete suite of AI-powered tools designed specifically for students and recent graduates.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding">
        <div className="page-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs">Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From signup to your personalized career roadmap in minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%-8px)] w-full h-px bg-border z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-xs font-mono font-semibold text-muted-foreground mb-3">{step.step}</div>
                  <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose CRS */}
      <section className="section-padding border-t border-border bg-card/50">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-xs">Why ELEVATE</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Built for serious career outcomes,
                not generic advice
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Most career platforms give you generic job boards or static templates. ELEVATE is different — it understands your specific profile, benchmarks you against real outcomes, and gives you an explainable, actionable plan.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'Explainable AI — every recommendation has a clear reason' },
                  { icon: TrendingUp, text: 'Tracks your placement readiness score over time' },
                  { icon: Users, text: 'Benchmarked against thousands of successful students' },
                  { icon: Zap, text: 'Integrates with your coursework and certifications' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="shrink-0 h-5 w-5 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                      <CheckCircle className="h-3 w-3 text-success" />
                    </div>
                    <p className="text-sm text-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Placement readiness</p>
              <div className="space-y-3">
                {[
                  { label: 'Technical Skills', pct: 78 },
                  { label: 'Soft Skills', pct: 65 },
                  { label: 'Resume Quality', pct: 82 },
                  { label: 'Market Alignment', pct: 71 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{item.label}</span>
                      <span className="text-muted-foreground">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div
                        className="h-1.5 bg-primary rounded-full transition-all"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Overall readiness score: <span className="font-semibold text-foreground">74/100</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section id="ai-capabilities" className="section-padding">
        <div className="page-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs">AI engine</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Powered by purpose-built AI</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not generic LLM wrappers. Purpose-built AI models trained on career data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiCapabilities.map((cap) => (
              <div
                key={cap.label}
                className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors"
              >
                <div className="shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="text-sm font-medium text-foreground">{cap.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding border-t border-border bg-card/50">
        <div className="page-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-xs">FAQ</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Frequently asked questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group border border-border rounded-lg [&[open]]:border-primary/40"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-sm font-medium hover:text-primary transition-colors">
                    {faq.question}
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section-padding">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Questions? Talk to us.
            </h2>
            <p className="text-muted-foreground mb-8">
              Reach out to learn how ELEVATE can be deployed at your institution.
            </p>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <textarea
                rows={4}
                placeholder="Your message"
                className="mt-4 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
              <Button className="mt-4 w-full" id="contact-submit">Send message</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section-padding border-t border-border bg-primary/5">
        <div className="page-container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to take control of your career?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join students who are using AI to make smarter career decisions. Free to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register">
              <Button size="xl" id="bottom-cta-primary">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="xl" variant="outline" id="bottom-cta-secondary">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
