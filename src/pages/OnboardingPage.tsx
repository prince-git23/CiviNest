import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ArrowLeft, Globe } from 'lucide-react';
import { OnboardingFormData, OnboardingStepId, UserRoleConfig } from '../types';
import { ONBOARDING_STEPS } from '../components/onboarding/onboardingData';
import ProgressStepper from '../components/onboarding/ProgressStepper';
import StepProfile from '../components/onboarding/StepProfile';
import StepLocation from '../components/onboarding/StepLocation';
import StepCommunity from '../components/onboarding/StepCommunity';
import StepInterests from '../components/onboarding/StepInterests';
import StepReview from '../components/onboarding/StepReview';
import CivicOnboardingScene from '../components/onboarding/CivicOnboardingScene';
import SceneStatus from '../components/onboarding/SceneStatus';

interface OnboardingPageProps {
  onBackToPlatform: () => void;
  onComplete: (data: OnboardingFormData) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onBackToPlatform,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>('profile');
  const [formData, setFormData] = useState<OnboardingFormData>({
    profile: {
      fullName: '',
      email: '',
      phone: '',
      countryCode: '+91',
    },
    location: {
      city: 'Nagpur',
      ward: 'Dharampeth (Ward 12)',
      locality: 'Dharampeth',
      pincode: '440010',
      isGeoLocated: false,
    },
    community: {
      societyId: 'soc-01',
      societyName: 'Shalimar Apartments RWA',
      societyType: 'Apartment Complex',
      isCustom: false,
      memberCount: 142,
    },
    interests: ['water', 'roads', 'lighting', 'waste'],
  });

  const stepContainerRef = useRef<HTMLDivElement>(null);
  const previousStepIndexRef = useRef<number>(0);

  const currentStepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep);
  const currentStepConfig = ONBOARDING_STEPS[currentStepIndex] || ONBOARDING_STEPS[0];

  // GSAP Step Transition
  useEffect(() => {
    if (!stepContainerRef.current) return;

    const isMovingForward = currentStepIndex >= previousStepIndexRef.current;
    previousStepIndexRef.current = currentStepIndex;

    const fromX = isMovingForward ? 24 : -24;

    gsap.fromTo(
      stepContainerRef.current,
      { opacity: 0, x: fromX },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [currentStep, currentStepIndex]);

  // Form updates
  const updateProfile = (data: Partial<OnboardingFormData['profile']>) => {
    setFormData((prev) => ({ ...prev, profile: { ...prev.profile, ...data } }));
  };

  const updateLocation = (data: Partial<OnboardingFormData['location']>) => {
    setFormData((prev) => ({ ...prev, location: { ...prev.location, ...data } }));
  };

  const updateCommunity = (data: Partial<OnboardingFormData['community']>) => {
    setFormData((prev) => ({ ...prev, community: { ...prev.community, ...data } }));
  };

  const toggleInterest = (id: OnboardingFormData['interests'][number]) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(id);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((item) => item !== id)
          : [...prev.interests, id],
      };
    });
  };

  // Step Navigation helpers
  const goToNextStep = () => {
    if (currentStep === 'profile') setCurrentStep('location');
    else if (currentStep === 'location') setCurrentStep('community');
    else if (currentStep === 'community') setCurrentStep('interests');
    else if (currentStep === 'interests') setCurrentStep('review');
  };

  const goToPreviousStep = () => {
    if (currentStep === 'location') setCurrentStep('profile');
    else if (currentStep === 'community') setCurrentStep('location');
    else if (currentStep === 'interests') setCurrentStep('community');
    else if (currentStep === 'review') setCurrentStep('interests');
    else if (currentStep === 'profile') onBackToPlatform();
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FBFBFA] font-sans antialiased text-[#111827]">
      {/* Left Panel — Form & Progress */}
      <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 border-r border-[#E5E7EB] bg-white z-10 min-h-screen overflow-y-auto">
        <div>
          {/* Top Return link */}
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={onBackToPlatform}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#0F1E36] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to CiviNest</span>
            </button>

            <span className="text-[11px] font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>

          {/* Onboarding Header with Globe Icon */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F1E36] tracking-tight">
                Welcome to CiviNest
              </h1>
              <div className="w-10 h-10 rounded-2xl bg-[#E0E7FF]/80 text-[#2563EB] flex items-center justify-center shadow-2xs shrink-0">
                <Globe className="w-5 h-5" />
              </div>
            </div>

            <p className="text-sm text-[#64748B] font-sans mt-2.5 max-w-md leading-relaxed">
              Join {formData.location.city}'s leading civic intelligence platform. Set up your profile to connect with your local community and infrastructure updates.
            </p>
          </div>

          {/* Progress Stepper */}
          <ProgressStepper
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />

          {/* Step Form Container with GSAP animations */}
          <div ref={stepContainerRef} className="mt-8">
            {currentStep === 'profile' && (
              <StepProfile
                data={formData.profile}
                onUpdate={updateProfile}
                onNext={goToNextStep}
              />
            )}

            {currentStep === 'location' && (
              <StepLocation
                data={formData.location}
                onUpdate={updateLocation}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
              />
            )}

            {currentStep === 'community' && (
              <StepCommunity
                data={formData.community}
                userWard={formData.location.ward}
                onUpdate={updateCommunity}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
              />
            )}

            {currentStep === 'interests' && (
              <StepInterests
                selectedInterests={formData.interests}
                onToggleInterest={toggleInterest}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
              />
            )}

            {currentStep === 'review' && (
              <StepReview
                formData={formData}
                onEditStep={(step) => setCurrentStep(step)}
                onBack={goToPreviousStep}
                onComplete={() => onComplete(formData)}
              />
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-8 mt-6 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span>© 2026 CiviNest Civic Intelligence</span>
          <span className="font-mono">CIVIC-ID // ACTIVE</span>
        </div>
      </div>

      {/* Right Panel — 3D Civic Onboarding Scene */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[55%] relative min-h-screen bg-[#11161f]">
        <CivicOnboardingScene
          currentStep={currentStep}
          selectedInterests={formData.interests}
          selectedWard={formData.location.ward}
        />

        {/* Dynamic Floating Scene Status Indicator */}
        <SceneStatus
          stepConfig={currentStepConfig}
          customLocality={formData.location.locality}
        />
      </div>
    </div>
  );
};

export default OnboardingPage;
