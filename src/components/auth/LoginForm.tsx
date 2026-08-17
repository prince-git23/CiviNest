import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, CheckCircle2, Shield } from 'lucide-react';
import { UserRoleConfig } from '../../types';
import { TrustIndicators } from './TrustIndicators';
import { loginUser } from '../../services/api';

interface LoginFormProps {
  role: UserRoleConfig;
  onChangeRole: () => void;
  onLoginSuccess?: (role: UserRoleConfig, authData?: { token: string; userId: string; email: string; name: string; backendRole?: string }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  onChangeRole,
  onLoginSuccess,
}) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await loginUser({
        email: credential.trim(),
        password,
      });

      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(role, {
            token: result.token,
            userId: result.user._id,
            email: result.user.email,
            name: result.user.name,
            backendRole: result.user.role,
          });
        }
      }, 1200);
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="w-full flex flex-col justify-between min-h-[580px]">
      <div>
        {/* Change Role Back Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={onChangeRole}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] transition-colors py-1 px-2 -ml-2 rounded-md hover:bg-black/5 cursor-pointer"
            aria-label="Change Selected Role"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Role</span>
          </button>
        </div>

        {/* Dynamic Selected Role Badge */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] text-[11px] font-mono font-semibold uppercase tracking-wider mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
          <span>{role.label}</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1E36] tracking-tight font-serif mb-1.5">
          Sign in to continue
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mb-6 font-sans">
          Accessing CiviNest as <strong className="text-[#0F1E36] font-medium">{role.title}</strong>
        </p>

        {/* Scope Pill */}
        <div className="p-3 bg-[#F4F5F7] rounded-xl border border-[#E5E7EB] mb-5 text-xs text-[#4B5563] flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#0F1E36] block">Authorized Scope:</span>
            <span className="text-[#64748B]">{role.accessScope}</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={credential}
                onChange={(e) => {
                  setCredential(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#D1D5DB] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none text-sm text-[#0F1E36] bg-white transition-all placeholder:text-[#9CA3AF]"
                required
              />
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#374151]">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password recovery coming soon.')}
                className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl border border-[#D1D5DB] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none text-sm text-[#0F1E36] bg-white transition-all placeholder:text-[#9CA3AF]"
                required
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
          </div>

          {/* Remember me */}
          <div className="flex items-center text-xs pt-1">
            <label className="flex items-center gap-2 text-[#4B5563] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB]"
              />
              <span>Remember this session</span>
            </label>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
              isSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-md'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Authenticated as {role.title}</span>
              </>
            ) : (
              <span>Sign In as {role.title}</span>
            )}
          </button>
        </form>
      </div>

      {/* Trust Strip */}
      <div className="mt-8">
        <TrustIndicators />
      </div>
    </div>
  );
};

export default LoginForm;
