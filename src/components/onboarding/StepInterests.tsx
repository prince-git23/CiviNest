import React from 'react';
import { ArrowLeft, ArrowRight, Droplets, Footprints, Lightbulb, Trash2, Trees, ShieldAlert, Zap, HeartPulse, Check } from 'lucide-react';
import { CivicInterestId } from '../../types';
import { CIVIC_INTERESTS } from './onboardingData';

interface StepInterestsProps {
  selectedInterests: CivicInterestId[];
  onToggleInterest: (id: CivicInterestId) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepInterests: React.FC<StepInterestsProps> = ({
  selectedInterests,
  onToggleInterest,
  onBack,
  onNext,
}) => {
  const getInterestIcon = (id: CivicInterestId) => {
    switch (id) {
      case 'water':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'roads':
        return <Footprints className="w-4 h-4 text-amber-600" />;
      case 'lighting':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'waste':
        return <Trash2 className="w-4 h-4 text-emerald-600" />;
      case 'parks':
        return <Trees className="w-4 h-4 text-teal-600" />;
      case 'safety':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'power':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'amenities':
        return <HeartPulse className="w-4 h-4 text-slate-600" />;
      default:
        return <Droplets className="w-4 h-4" />;
    }
  };

  const handleSelectAll = () => {
    if (selectedInterests.length === CIVIC_INTERESTS.length) {
      // Clear all except water
      onToggleInterest('water');
    } else {
      CIVIC_INTERESTS.forEach((item) => {
        if (!selectedInterests.includes(item.id)) {
          onToggleInterest(item.id);
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight font-serif mb-1">
            Civic Interests
          </h2>
          <p className="text-xs sm:text-[13.5px] text-[#64748B] font-sans">
            Choose the civic issue streams and alert feeds you want to monitor.
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1 font-sans">This step is optional — you can customize your interests later.</p>
        </div>

        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] shrink-0 mt-1 cursor-pointer"
        >
          {selectedInterests.length === CIVIC_INTERESTS.length ? 'Reset Filters' : 'Select All'}
        </button>
      </div>

      {/* Selected Count Indicator */}
      <div className="flex items-center justify-between text-xs text-[#4B5563] bg-[#F4F5F7] p-2.5 rounded-xl border border-[#E5E7EB]">
        <span className="font-medium">
          Active Feed Subscriptions:{' '}
          <strong className="text-[#0F1E36]">{selectedInterests.length} of {CIVIC_INTERESTS.length}</strong>
        </span>
        <span className="text-[11px] font-mono text-[#2563EB] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
          Real-time AI Filtering
        </span>
      </div>

      {/* Grid of Interests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
        {CIVIC_INTERESTS.map((item) => {
          const isSelected = selectedInterests.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleInterest(item.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex items-start justify-between gap-2.5 cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#2563EB] ring-1.5 ring-[#2563EB]/20 shadow-xs'
                  : 'bg-[#F4F5F7]/70 hover:bg-white border-[#E5E7EB] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-blue-50' : 'bg-[#E5E7EB]'
                  }`}
                >
                  {getInterestIcon(item.id)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#0F1E36] truncate block">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 leading-tight mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Checkbox badge */}
              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-1 transition-colors ${
                  isSelected
                    ? 'bg-[#2563EB] text-white'
                    : 'border border-[#CBD5E1] bg-white'
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] hover:bg-black/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className="text-xs font-medium text-[#6B7280] hover:text-[#374151] transition-colors cursor-pointer px-3 py-2.5"
          >
            {selectedInterests.length === 0 ? 'Skip for now' : 'Skip'}
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default StepInterests;
