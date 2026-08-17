import React, { useEffect, useState } from 'react';
import {
  User,
  Bell,
  Lock,
  SlidersHorizontal,
  MapPin,
  Check,
  RotateCcw,
  ShieldCheck,
  Eye,
  Map as MapIcon,
  BarChart3,
  Save,
} from 'lucide-react';
import {
  loadSettings,
  saveSettings,
  defaultRepSettings,
  localityOptions,
  type RepSettings,
  type VisibilityValue,
} from '../../services/repSettingsService';

interface RepresentativeSettingsProps {
  communityName?: string;
  wardName?: string;
}

const VISIBILITY_OPTIONS: { value: VisibilityValue; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'community', label: 'Community' },
  { value: 'private', label: 'Private' },
];

export const RepresentativeSettings: React.FC<RepresentativeSettingsProps> = ({
  communityName = 'Green Valley Residency',
  wardName = 'Ward 12, Nagpur',
}) => {
  const [settings, setSettings] = useState<RepSettings>(() => loadSettings());
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    saveSettings(settings);
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1600);
    return () => clearTimeout(t);
  }, [settings]);

  const toggleNotification = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, enabled: !n.enabled } : n
      ),
    }));
  };

  const updatePrivacy = (id: string, value: VisibilityValue) => {
    setSettings((prev) => ({
      ...prev,
      privacy: prev.privacy.map((s) => (s.id === id ? { ...s, value } : s)),
    }));
  };

  const updatePreference = <K extends keyof RepSettings['preferences']>(
    key: K,
    value: RepSettings['preferences'][K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  const resetToDefaults = () => {
    setSettings(structuredClone(defaultRepSettings));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Settings
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Manage your representative account, notifications, privacy and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedFlash && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-full animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5" />
              Saved locally
            </span>
          )}
          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4B5563] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── ACCOUNT ── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-base font-bold text-[#0F1E36]">Account</h2>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-sm font-bold">
                PR
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Prince Yadav</p>
                <p className="text-[11px] text-[#6B7280]">prince.yadav@email.com</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Role</span>
                <span className="font-semibold text-[#111827]">Community Representative</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Community</span>
                <span className="font-semibold text-[#111827]">{communityName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Ward</span>
                <span className="font-semibold text-[#111827]">{wardName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Verification</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-4 pt-3 border-t border-[#F3F4F6]">
              Profile details are managed on the Profile page.
            </p>
          </div>

          {/* ── PRIVACY ── */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-slate-600" />
              <h2 className="text-base font-bold text-[#0F1E36]">Privacy</h2>
            </div>
            <div className="space-y-4">
              {settings.privacy.map((setting) => (
                <div key={setting.id}>
                  <div className="flex items-start gap-2.5 mb-2">
                    <Eye className="w-4 h-4 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#111827]">{setting.label}</p>
                      <p className="text-[11px] text-[#6B7280]">{setting.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pl-6.5 ml-0.5">
                    {VISIBILITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updatePrivacy(setting.id, option.value)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          setting.value === option.value
                            ? 'bg-[#0F1E36] text-white'
                            : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── NOTIFICATIONS + PREFERENCES ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-base font-bold text-[#0F1E36]">Notifications</h2>
            </div>
            <p className="text-xs text-[#6B7280] mb-4">
              Choose which community updates you receive in the notification center
            </p>
            <div className="space-y-3">
              {settings.notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827]">{notif.label}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{notif.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification(notif.id)}
                    aria-pressed={notif.enabled}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      notif.enabled ? 'bg-[#2563EB]' : 'bg-[#D1D5DB]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        notif.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-[#0F1E36]">Preferences</h2>
            </div>

            {/* Default locality */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#111827] mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                Default Locality
              </p>
              <select
                value={settings.preferences.defaultLocality}
                onChange={(e) => updatePreference('defaultLocality', e.target.value)}
                className="w-full md:w-72 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              >
                {localityOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Default analytics range */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#111827] mb-2 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#6B7280]" />
                Default Analytics Range
              </p>
              <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-1 w-fit">
                {(['30D', '90D', 'YTD'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => updatePreference('defaultAnalyticsRange', range)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      settings.preferences.defaultAnalyticsRange === range
                        ? 'bg-[#0F1E36] text-white'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Map style */}
            <div>
              <p className="text-xs font-semibold text-[#111827] mb-2 flex items-center gap-1.5">
                <MapIcon className="w-3.5 h-3.5 text-[#6B7280]" />
                Map Style
              </p>
              <div className="flex gap-2">
                {([
                  { value: 'standard', label: 'Standard' },
                  { value: 'satellite', label: 'Satellite' },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePreference('mapStyle', option.value)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      settings.preferences.mapStyle === option.value
                        ? 'bg-[#0F1E36] text-white border-[#0F1E36]'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <Save className="w-4 h-4 text-[#6B7280] mt-0.5" />
            <p className="text-[11.5px] text-[#4B5563] leading-relaxed">
              Settings are saved locally on this device (demo persistence). When the CiviNest backend is
              available, these preferences will sync to your representative account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeSettings;
