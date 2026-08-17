import React from 'react';
import { ArrowLeft, Home, User, Sparkles } from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';

export interface WorkflowBreadcrumbItem {
  label: string;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'slate';
  onClick?: () => void;
}

export interface WorkflowHeaderProps {
  backLabel?: string;
  onBack: () => void;
  onNavigateHome?: () => void;
  breadcrumbs?: WorkflowBreadcrumbItem[];
  rightActions?: React.ReactNode;
  stepIndicator?: string;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  backLabel = 'Back',
  onBack,
  onNavigateHome,
  breadcrumbs = [],
  rightActions,
  stepIndicator,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-[#E5E7EB] py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Back action + Logo + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Contextual Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#4B5563] hover:text-[#0F1E36] hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36]"
            aria-label={backLabel}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{backLabel}</span>
          </button>

          <div className="h-4 w-px bg-slate-300 shrink-0" />

          {/* CiviNest Logo */}
          <button
            type="button"
            onClick={onNavigateHome || onBack}
            className="flex items-center cursor-pointer shrink-0"
            aria-label="CiviNest Home"
          >
            <CiviNestLogo size={26} />
          </button>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="hidden md:flex items-center gap-2 min-w-0 pl-2">
              <span className="text-xs font-mono text-slate-300">/</span>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-xs font-mono text-slate-300">/</span>}
                  {crumb.onClick ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] transition-colors truncate cursor-pointer"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#0F172A] truncate">
                      {crumb.label}
                    </span>
                  )}
                  {crumb.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        crumb.badgeColor === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : crumb.badgeColor === 'amber'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : crumb.badgeColor === 'blue'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {crumb.badge}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Step Indicator or Contextual Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {stepIndicator && (
            <span className="hidden sm:inline-flex text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {stepIndicator}
            </span>
          )}

          {rightActions}
        </div>
      </div>
    </header>
  );
};

export default WorkflowHeader;
