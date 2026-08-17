import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { DashboardAIInsight } from '../../types';

interface AIInsightCardProps {
  insight: DashboardAIInsight;
  onExplorePattern?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onExplorePattern,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0F1E36] via-[#162544] to-[#1E293B] rounded-2xl p-6 text-white text-left shadow-md transition-all duration-200 hover:shadow-xl">
      {/* Decorative ambient background blur */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-blue-200/90">
              {insight.eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight leading-snug mb-2.5">
            {insight.headline}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
            {insight.description}
          </p>
        </div>

        {/* Action Link / Button */}
        {onExplorePattern && (
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono text-blue-300/80">
              AI Confidence: {insight.confidenceScore}% · {insight.affectedSector}
            </span>

            <button
              onClick={onExplorePattern}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-blue-300 transition-colors cursor-pointer group"
            >
              <span>{insight.actionCta || 'View pattern on map'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightCard;
