import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, User, MapPin, Building2, Sparkles, Shield, Edit3, Loader2 } from 'lucide-react';
import { OnboardingFormData, OnboardingStepId } from '../../types';
import { CIVIC_INTERESTS } from './onboardingData';

interface StepReviewProps {
  formData: OnboardingFormData;
  onEditStep: (step: OnboardingStepId) => void;
  onBack: () => void;
  onComplete: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  formData,
  onEditStep,
  onBack,
  onComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const selectedInterestItems = CIVIC_INTERESTS.filter((item) =>
    formData.interests.includes(item.id)
  );

  return (
    <form onSubmit={handleFinalSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight font-serif mb-1">
          Almost there
        </h2>
        <p className="text-xs sm:text-[13.5px] text-[#64748B] font-sans">
          Review your details before entering CiviNest.
        </p>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {/* Section 1: Profile */}
        <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F4F5F7]/80 hover:bg-white transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-semibold text-[#0F1E36] font-mono uppercase tracking-wider">
                Profile
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep('profile')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Name:</span>
              <span className="font-semibold text-[#0F1E36]">{formData.profile.fullName || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Email:</span>
              <span className="font-medium text-[#0F1E36] font-mono text-[11px]">{formData.profile.email || 'Not provided'}</span>
            </div>
            {formData.profile.phone && (
              <div className="flex justify-between">
                <span className="text-[#64748B]">Phone:</span>
                <span className="font-medium text-[#0F1E36] font-mono text-[11px]">
                  {formData.profile.countryCode} {formData.profile.phone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F4F5F7]/80 hover:bg-white transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-semibold text-[#0F1E36] font-mono uppercase tracking-wider">
                Location & Ward
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep('location')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#64748B]">City / Jurisdiction:</span>
              <span className="font-semibold text-[#0F1E36]">{formData.location.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Ward Sector:</span>
              <span className="font-semibold text-[#0F1E36]">{formData.location.ward || 'General City Grid'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Pincode / GIS:</span>
              <span className="font-medium text-[#0F1E36] font-mono text-[11px]">
                {formData.location.pincode || '440010'} {formData.location.isGeoLocated ? '(GPS Verified)' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Community */}
        <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F4F5F7]/80 hover:bg-white transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-semibold text-[#0F1E36] font-mono uppercase tracking-wider">
                Community Node
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep('community')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Affiliation:</span>
              <span className="font-semibold text-[#0F1E36]">{formData.community.societyName || 'Independent Resident Node'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Cluster Type:</span>
              <span className="text-[#4B5563]">{formData.community.societyType || 'Civic Network'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Monitoring Priorities */}
        <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F4F5F7]/80 hover:bg-white transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-semibold text-[#0F1E36] font-mono uppercase tracking-wider">
                Monitoring Priorities ({selectedInterestItems.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep('interests')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-2.5 flex flex-wrap gap-1.5">
            {selectedInterestItems.length > 0 ? (
              selectedInterestItems.map((item) => (
                <span
                  key={item.id}
                  className="px-2 py-1 rounded-md text-[11px] font-medium bg-white text-[#0F1E36] border border-[#CBD5E1] shadow-2xs"
                >
                  {item.label}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#64748B]">All city-wide alerts subscribed</span>
            )}
          </div>
        </div>
      </div>

      {/* Trust & Security pill */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-[#1E3A8A]">
        <Shield className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
        <span>End-to-end encrypted civic node // Immutable municipal audit trail // TLS 1.3</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] hover:bg-black/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initializing Node...</span>
            </>
          ) : (
            <>
              <span>Enter CiviNest</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StepReview;
