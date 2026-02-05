import { Brain, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface AIBadgeProps {
  confidence?: number;
  variant?: 'default' | 'compact' | 'detailed';
  showIcon?: boolean;
  className?: string;
}

export function AIBadge({ 
  confidence = 0.85, 
  variant = 'default', 
  showIcon = true,
  className = '' 
}: AIBadgeProps) {
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className={`bg-purple-100 text-purple-700 border-purple-300 ${className}`}>
              <Brain className="w-3 h-3 mr-1" />
              AI
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">AI-Powered Calculation</p>
            <p className="text-xs text-gray-500">Confidence: {(confidence * 100).toFixed(0)}%</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 ${className}`}>
        {showIcon && <Brain className="w-4 h-4 text-purple-600" />}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-purple-700">AI-Powered</span>
          <span className="text-xs text-purple-600">{(confidence * 100).toFixed(0)}% confidence</span>
        </div>
      </div>
    );
  }

  return (
    <Badge variant="secondary" className={`bg-purple-100 text-purple-700 border-purple-300 ${className}`}>
      {showIcon && <Brain className="w-3 h-3 mr-1" />}
      AI-Powered • {(confidence * 100).toFixed(0)}% confidence
    </Badge>
  );
}

interface AICalculationBannerProps {
  calculationType: string;
  totalCalculations: number;
  avgConfidence: number;
  methodologies: string[];
}

export function AICalculationBanner({
  calculationType,
  totalCalculations,
  avgConfidence,
  methodologies
}: AICalculationBannerProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{calculationType}</h3>
            <p className="text-sm text-purple-100">
              {totalCalculations} calculations • {(avgConfidence * 100).toFixed(0)}% avg confidence
            </p>
          </div>
        </div>
        <AIBadge confidence={avgConfidence} variant="detailed" showIcon={false} className="bg-white/20 text-white border-white/30" />
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {methodologies.map((method, idx) => (
          <Badge key={idx} variant="outline" className="text-xs bg-white/10 text-white border-white/30">
            {method}
          </Badge>
        ))}
      </div>
    </div>
  );
}
