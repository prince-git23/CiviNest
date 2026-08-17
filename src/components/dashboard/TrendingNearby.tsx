import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  LineChart,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DashboardNearbyIssue } from '../../types';

interface TrendingNearbyProps {
  issues: DashboardNearbyIssue[];
  onSupportIssue: (issueId: string) => void;
  onViewData: (issue: DashboardNearbyIssue) => void;
}

export const TrendingNearby: React.FC<TrendingNearbyProps> = ({
  issues,
  onSupportIssue,
  onViewData,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [supportedMap, setSupportedMap] = useState<Record<string, boolean>>({});

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const toggleSupport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSupportedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    onSupportIssue(id);
  };

  const getBadgeStyle = (badgeType: DashboardNearbyIssue['badgeType']) => {
    switch (badgeType) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'investigating':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'trend':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'scheduled':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <section className="mt-8 mb-12 text-left">
      {/* Section Header with Carousel Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#0F1E36]">Trending Nearby</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Issues gaining traction in adjacent sectors.</p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {issues.map((issue) => {
          const isSupported = supportedMap[issue.id] ?? issue.isSupported;
          const currentCount = isSupported ? issue.supportCount + 1 : issue.supportCount;

          return (
            <div
              key={issue.id}
              className="w-80 sm:w-88 shrink-0 snap-start bg-white rounded-2xl border border-[#E5E7EB] p-4.5 shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Sector Tag */}
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border tracking-wider uppercase ${getBadgeStyle(
                      issue.badgeType
                    )}`}
                  >
                    {issue.badge}
                  </span>
                  <span className="text-[11px] font-mono text-[#6B7280]">
                    {issue.sector}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-[#111827] line-clamp-1 mb-1.5">
                  {issue.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2 mb-4">
                  {issue.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                {issue.hasViewData ? (
                  <button
                    onClick={() => onViewData(issue)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                  >
                    <LineChart className="w-3.5 h-3.5" />
                    <span>View Data</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => toggleSupport(issue.id, e)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSupported
                        ? 'bg-blue-50 text-[#2563EB] font-semibold ring-1 ring-blue-200'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${
                        isSupported ? 'fill-[#2563EB] text-[#2563EB]' : 'text-[#6B7280]'
                      }`}
                    />
                    <span>
                      {currentCount} {isSupported ? 'Supported' : 'Supports'}
                    </span>
                  </button>
                )}

                <span className="text-[10px] font-mono text-[#9CA3AF]">
                  {issue.locality}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrendingNearby;
