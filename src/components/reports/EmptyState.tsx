import React from 'react';
import { PlusCircle, Search, ClipboardList, CheckCircle2 } from 'lucide-react';

interface EmptyStateProps {
  filterType?: string;
  searchQuery?: string;
  onCreateSignal?: () => void;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filterType = 'all',
  searchQuery = '',
  onCreateSignal,
  onClearFilters,
}) => {
  if (searchQuery) {
    return (
      <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 sm:p-12 text-center max-w-md mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-[#64748B] flex items-center justify-center mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0F172A]">
          No matching civic signals found
        </h3>
        <p className="text-xs text-[#64748B]">
          No reports match your search query <span className="font-semibold text-[#0F172A]">"{searchQuery}"</span>.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer pt-2"
          >
            Clear search filters
          </button>
        )}
      </div>
    );
  }

  let title = 'No civic signals yet';
  let description = 'When you report something in your community, its journey will appear here.';

  if (filterType === 'active') {
    title = 'Nothing currently in progress';
    description = 'You have no active reports undergoing municipal field action at this moment.';
  } else if (filterType === 'awaiting') {
    title = 'No reports awaiting review';
    description = 'All your submitted signals have been triaged by the automated AI system.';
  } else if (filterType === 'resolved') {
    title = 'No resolved reports yet';
    description = 'Completed and citizen-verified reports will be archived in this section.';
  } else if (filterType === 'reopened') {
    title = 'No reopened reports';
    description = 'Great news! All verified signals have been closed without pending contractor dispute.';
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 sm:p-12 text-center max-w-md mx-auto space-y-4">
      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
        <ClipboardList className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{description}</p>
      </div>

      {onCreateSignal && (
        <button
          onClick={onCreateSignal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-blue-400" />
          <span>Report an Issue</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
