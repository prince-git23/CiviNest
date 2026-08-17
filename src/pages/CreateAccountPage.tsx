import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Shield,
  Building2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { CiviNestLogo } from '../components/common/CiviNestLogo';
import { TrustIndicators } from '../components/auth/TrustIndicators';
import { registerUser } from '../services/api';

interface CreateAccountPageProps {
  onBackToLanding: () => void;
  onAccountCreated: (accountData: { fullName: string; email: string; token: string; role: string; userId: string }) => void;
  onNavigateToSignIn: () => void;
}

type UserRole = 'resident' | 'community_rep' | 'municipal_officer';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export const CreateAccountPage: React.FC<CreateAccountPageProps> = ({
  onBackToLanding,
  onAccountCreated,
  onNavigateToSignIn,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('resident');

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  const validate = (checkAll = false): FormErrors => {
    const newErrors: FormErrors = {};
    const shouldCheck = (field: string) => checkAll || touched[field];

    if (shouldCheck('role') && !selectedRole) {
      newErrors.role = 'Please select how you will use CiviNest.';
    }

    if (shouldCheck('fullName')) {
      if (!fullName.trim()) {
        newErrors.fullName = 'Please enter your full name.';
      } else if (fullName.trim().length < 2) {
        newErrors.fullName = 'Name must be at least 2 characters.';
      }
    }

    if (shouldCheck('email')) {
      if (!email.trim()) {
        newErrors.email = 'Please enter your email address.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (shouldCheck('password')) {
      if (!password) {
        newErrors.password = 'Please create a password.';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters.';
      }
    }

    if (shouldCheck('confirmPassword')) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return newErrors;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(false);
    setErrors(fieldErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true, role: true });
    const fieldErrors = validate(true);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);
    setApiError(null);

    try {
      // Map frontend role IDs to backend role values
      const frontendToBackendRole: Record<UserRole, string> = {
        resident: 'CITIZEN',
        community_rep: 'COMMUNITY_REPRESENTATIVE',
        municipal_officer: 'MUNICIPAL_OFFICER',
      };

      const result = await registerUser({
        name: fullName.trim(),
        email: email.trim(),
        password,
        role: frontendToBackendRole[selectedRole],
      });

      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        onAccountCreated({
          fullName: result.user.name,
          email: result.user.email,
          token: result.token,
          role: result.user.role,
          userId: result.user._id,
        });
      }, 1200);
    } catch (error: any) {
      setIsLoading(false);
      setApiError(error.message || 'Registration failed. Please try again.');
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-400' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-400' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();
  const isFormValid = !validate(true) || Object.keys(validate(true)).length === 0;

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-[#0F1E36] selection:text-white">
      {/* Simple Header */}
      <header className="relative border-b border-[#E5E7EB] bg-white px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] transition-colors cursor-pointer py-1.5 px-2 -ml-2 rounded-lg hover:bg-black/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CiviNest</span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <CiviNestLogo size={24} showText={true} />
          </div>
          <div className="w-[140px]" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div ref={panelRef} className="w-full max-w-md">
          {isSuccess ? (
            /* Success State */
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-lg text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-[#0F1E36] mb-2">Account created successfully</h2>
              <p className="text-sm text-[#6B7280] mb-6">
                Welcome to CiviNest, {fullName.split(' ')[0]}.<br />
                Let's set up your civic profile.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
                <span className="w-4 h-4 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
                <span>Setting up your experience...</span>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-lg">
              {/* Eyebrow */}
              <span className="text-[11px] font-semibold tracking-widest text-[#4B5563] uppercase font-mono mb-2.5 block">
                GET STARTED
              </span>

              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1E36] tracking-tight mb-1.5">
                Create your CiviNest account
              </h1>
              <p className="text-sm text-[#64748B] mb-6">
                Join your city's civic intelligence platform.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                      onBlur={() => handleBlur('fullName')}
                      placeholder="e.g. Arjun Mehta"
                      className={`w-full px-3.5 py-2.5 pl-9 rounded-xl border text-sm text-[#0F1E36] bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all placeholder:text-[#9CA3AF] ${
                        errors.fullName ? 'border-red-400 bg-red-50/40' : 'border-[#D1D5DB]'
                      }`}
                    />
                    <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@example.com"
                      className={`w-full px-3.5 py-2.5 pl-9 rounded-xl border text-sm text-[#0F1E36] bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all placeholder:text-[#9CA3AF] ${
                        errors.email ? 'border-red-400 bg-red-50/40' : 'border-[#D1D5DB]'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      onBlur={() => handleBlur('password')}
                      placeholder="Minimum 8 characters"
                      className={`w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl border text-sm text-[#0F1E36] bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all placeholder:text-[#9CA3AF] ${
                        errors.password ? 'border-red-400 bg-red-50/40' : 'border-[#D1D5DB]'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#9CA3AF] hover:text-[#4B5563] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                  {/* Password strength bar */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-colors ${
                                i <= strength.level ? strength.color : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">
                          {strength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">
                    I will use CiviNest as a
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {(
                      [
                        { id: 'resident' as UserRole, label: 'Resident', desc: 'Report issues, track resolutions, verify fixes', icon: User, color: 'blue' },
                        { id: 'community_rep' as UserRole, label: 'Community Representative', desc: 'Coordinate concerns, oversee local clusters', icon: Users, color: 'emerald' },
                        { id: 'municipal_officer' as UserRole, label: 'Municipal Officer', desc: 'Review intelligence, assign departments, track SLA', icon: Building2, color: 'amber' },
                      ]
                    ).map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.id);
                            if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/15 shadow-sm'
                              : 'bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-white'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#2563EB] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-[#0F1E36] block">{role.label}</span>
                            <span className="text-[11px] text-[#6B7280] leading-tight block">{role.desc}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${
                            isSelected ? 'text-[#2563EB]' : 'text-[#CBD5E1]'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                  {errors.role && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Re-enter your password"
                      className={`w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl border text-sm text-[#0F1E36] bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all placeholder:text-[#9CA3AF] ${
                        errors.confirmPassword ? 'border-red-400 bg-red-50/40' : 'border-[#D1D5DB]'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-[#9CA3AF] hover:text-[#4B5563] transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {confirmPassword && confirmPassword === password && !errors.confirmPassword && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Error summary */}
                {(errors.fullName && errors.email && errors.password && errors.confirmPassword) && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    Please fix the errors above to create your account.
                  </div>
                )}

                {/* API Error */}
                {apiError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    {apiError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2 mt-2 ${
                    isLoading
                      ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                      : 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>

                {/* Sign In link */}
                <p className="text-center text-sm text-[#6B7280] pt-2">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onNavigateToSignIn}
                    className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>

              {/* Trust Strip */}
              <div className="mt-6">
                <TrustIndicators />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
