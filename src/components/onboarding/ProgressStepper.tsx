import React from 'react';
import { User, MapPin, Users, Sparkles, CheckCircle2, Check } from 'lucide-react';
import { OnboardingStepId } from '../../types';
import { ONBOARDING_STEPS, StepConfig } from './onboardingData';

interface ProgressStepperProps {
  currentStep: OnboardingStepId;
  onStepClick?: (step: OnboardingStepId) => void;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  onStepClick,
}) => {
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep);
  const currentStepConfig = ONBOARDING_STEPS[currentIndex] || ONBOARDING_STEPS[0];

  // Calculate percentage of progress line
  const progressPercent = (currentIndex / (ONBOARDING_STEPS.length - 1)) * 100;

  const getStepIcon = (step: StepConfig, isCompleted: boolean) => {
    if (isCompleted) {
      return <Check className="w-3.5 h-3.5 stroke-[2.5]" />;
    }
    switch (step.id) {
      case 'profile':
        return <User className="w-3.5 h-3.5" />;
      case 'location':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'community':
        return <Users className="w-3.5 h-3.5" />;
      case 'interests':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'review':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full my-6 select-none" aria-label="Onboarding Progress">
      <div className="relative flex items-center justify-between">
        {/* Background Track Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-full bg-[#E5E7EB] z-0" />

        {/* Animated Active Progress Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-[#0F1E36] transition-all duration-400 ease-out z-0"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Step Nodes */}
        {ONBOARDING_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isAccessible = idx <= currentIndex;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onStepClick && onStepClick(step.id)}
              className={`relative z-10 flex flex-col items-center group transition-transform ${
                isAccessible ? 'cursor-pointer' : 'cursor-default'
              }`}
              aria-label={`Step ${idx + 1}: ${step.label} ${
                isCurrent ? '(Current)' : isCompleted ? '(Completed)' : ''
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isCurrent
                    ? 'bg-[#0F1E36] text-white ring-4 ring-[#0F1E36]/15 scale-110 shadow-xs'
                    : isCompleted
                    ? 'bg-[#0F1E36] text-white hover:opacity-90'
                    : 'bg-[#E5E7EB] text-[#9CA3AF]'
                }`}
              >
                {getStepIcon(step, isCompleted)}
              </div>

              {/* Step Label below circle */}
              <span
                className={`text-[9.5px] sm:text-[10.5px] tracking-wider uppercase font-mono font-medium mt-2 transition-colors duration-200 ${
                  isCurrent
                    ? 'text-[#0F1E36] font-bold'
                    : isCompleted
                    ? 'text-[#4B5563]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;
