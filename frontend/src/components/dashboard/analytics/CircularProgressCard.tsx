import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CircularProgressCardProps {
  score: number; // 0-100
  title: string;
  description: string;
}

export const CircularProgressCard = React.memo(({ score, title, description }: CircularProgressCardProps) => {
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "text-rose-500";
  if (score > 70) color = "text-emerald-500";
  else if (score > 40) color = "text-amber-500";

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">Calculated using a weighted average of Resume Score, Career Match, and Roadmap Progress.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="relative flex items-center justify-center">
          {/* Background Circle */}
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="text-muted/30"
            />
            {/* Progress Circle */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className={color}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold tracking-tighter", color)}>{score}%</span>
            <span className="text-xs text-muted-foreground font-medium mt-1">
              {score > 70 ? 'Ready' : score > 40 ? 'On Track' : 'Needs Work'}
            </span>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6 px-4">
          {description}
        </p>
      </CardContent>
    </Card>
  );
});

CircularProgressCard.displayName = "CircularProgressCard";
