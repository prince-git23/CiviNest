import React, { useState } from 'react';
import { ArrowRight, User, Mail, Phone, ShieldCheck } from 'lucide-react';
import { UserProfileData } from '../../types';

interface StepProfileProps {
  data: UserProfileData;
  onUpdate: (data: Partial<UserProfileData>) => void;
  onNext: () => void;
  accountEmail?: string;
}

export const StepProfile: React.FC<StepProfileProps> = ({
  data,
  onUpdate,
  onNext,
  accountEmail,
}) => {
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: { fullName?: string; email?: string; phone?: string } = {};

    if (!data.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (data.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (data.phone.trim() && !/^[0-9\s\-]{8,15}$/.test(data.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number format.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight font-serif mb-1">
          Basic Information
        </h2>
        <p className="text-xs sm:text-[13.5px] text-[#64748B] font-sans">
          Used to verify your identity within civic networks.
        </p>
      </div>

      {/* Full Name field */}
      <div>
        <label className="block text-xs font-semibold text-[#374151] mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => {
              onUpdate({ fullName: e.target.value });
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            placeholder="e.g. Arjun Mehta"
            className={`w-full px-3.5 py-3 rounded-xl border text-sm text-[#0F1E36] bg-[#F4F5F7]/90 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 outline-none transition-all placeholder:text-[#9CA3AF] ${
              errors.fullName ? 'border-red-400 bg-red-50/40' : 'border-[#E5E7EB]'
            }`}
            required
          />
        </div>
        {errors.fullName && (
          <p className="text-xs text-red-600 mt-1 font-sans">{errors.fullName}</p>
        )}
      </div>

      {/* Email Address field — read-only if from account creation */}
      <div>
        <label className="block text-xs font-semibold text-[#374151] mb-1.5">
          Email Address {accountEmail && <span className="text-[#9CA3AF] font-normal">(from your account)</span>}
        </label>
        <div className="relative">
          <input
            type="email"
            value={data.email}
            onChange={(e) => {
              onUpdate({ email: e.target.value });
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="e.g. arjun.mehta@example.com"
            readOnly={Boolean(accountEmail)}
            className={`w-full px-3.5 py-3 rounded-xl border text-sm text-[#0F1E36] bg-[#F4F5F7]/90 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 outline-none transition-all placeholder:text-[#9CA3AF] ${
              accountEmail ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''
            } ${
              errors.email ? 'border-red-400 bg-red-50/40' : 'border-[#E5E7EB]'
            }`}
            required
          />
        </div>
        {accountEmail && (
          <p className="text-[11px] text-[#6B7280] mt-1">This email was used to create your account.</p>
        )}
        {errors.email && (
          <p className="text-xs text-red-600 mt-1 font-sans">{errors.email}</p>
        )}
      </div>

      {/* Phone Number (Optional) with country code */}
      <div>
        <label className="block text-xs font-semibold text-[#374151] mb-1.5">
          Phone Number <span className="text-[#9CA3AF] font-normal">(Optional)</span>
        </label>
        <div className="flex gap-2">
          <div className="w-20 shrink-0">
            <input
              type="text"
              value={data.countryCode}
              onChange={(e) => onUpdate({ countryCode: e.target.value })}
              className="w-full px-3 py-3 rounded-xl border border-[#E5E7EB] text-sm text-center font-mono font-medium text-[#0F1E36] bg-[#F4F5F7]/90 focus:bg-white focus:border-[#2563EB] outline-none"
              placeholder="+91"
            />
          </div>
          <div className="flex-1">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => {
                onUpdate({ phone: e.target.value });
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="98765 43210"
              className={`w-full px-3.5 py-3 rounded-xl border text-sm text-[#0F1E36] bg-[#F4F5F7]/90 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 outline-none transition-all placeholder:text-[#9CA3AF] ${
                errors.phone ? 'border-red-400 bg-red-50/40' : 'border-[#E5E7EB]'
              }`}
            />
          </div>
        </div>
        {errors.phone && (
          <p className="text-xs text-red-600 mt-1 font-sans">{errors.phone}</p>
        )}
      </div>

      {/* Trust notice */}
      <div className="flex items-center gap-2 py-1 text-xs text-[#64748B]">
        <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
        <span>Your contact details are encrypted and only used for verified civic alerts.</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default StepProfile;
