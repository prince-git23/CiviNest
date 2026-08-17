import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  User,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Settings,
  Bell,
  Lock,
  Eye,
  Camera,
  Droplet,
  Car,
  Lightbulb,
  Trash2,
  Zap,
  TreePine,
  CloudRain,
  Mail,
  RefreshCw,
  Building,
  Home,
  Users,
  ChevronRight,
  Edit3,
  Award,
  Clock,
} from 'lucide-react';
import {
  ProfileOptimizationData,
  ProfilePreference,
  NotificationPreference,
  PrivacySetting,
  defaultProfileData,
  calculateCompletionPercentage,
  getProfileStrengthLabel,
  getVerificationBadgeColor,
} from '../services/profileService';

interface ProfileOptimizationPageProps {
  userContext?: {
    name: string;
    city: string;
    ward: string;
    community: string;
  };
  profileData?: ProfileOptimizationData;
  onUpdatePreferences?: (preferences: ProfilePreference[]) => void;
  onUpdateNotifications?: (notifications: NotificationPreference[]) => void;
  onUpdatePrivacy?: (privacy: PrivacySetting[]) => void;
}

const getPreferenceIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    Car: <Car className="w-4 h-4" />,
    Droplet: <Droplet className="w-4 h-4" />,
    Lightbulb: <Lightbulb className="w-4 h-4" />,
    Trash2: <Trash2 className="w-4 h-4" />,
    Zap: <Zap className="w-4 h-4" />,
    Shield: <ShieldCheck className="w-4 h-4" />,
    TreePine: <TreePine className="w-4 h-4" />,
    CloudRain: <CloudRain className="w-4 h-4" />,
  };
  return icons[iconName] || <Settings className="w-4 h-4" />;
};

const getNotificationIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    AlertTriangle: <AlertCircle className="w-4 h-4" />,
    RefreshCw: <RefreshCw className="w-4 h-4" />,
    CheckCircle2: <CheckCircle2 className="w-4 h-4" />,
    Users: <Users className="w-4 h-4" />,
    Building2: <Building2 className="w-4 h-4" />,
    Mail: <Mail className="w-4 h-4" />,
  };
  return icons[iconName] || <Bell className="w-4 h-4" />;
};

const getPrivacyIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    Eye: <Eye className="w-4 h-4" />,
    Activity: <RefreshCw className="w-4 h-4" />,
    MapPin: <MapPin className="w-4 h-4" />,
    Camera: <Camera className="w-4 h-4" />,
  };
  return icons[iconName] || <Lock className="w-4 h-4" />;
};

export const ProfileOptimizationPage: React.FC<ProfileOptimizationPageProps> = ({
  userContext = {
    name: 'Prince',
    city: 'Nagpur',
    ward: 'Dharampeth Ward 14',
    community: 'Green Valley Residency',
  },
  profileData = defaultProfileData,
  onUpdatePreferences,
  onUpdateNotifications,
  onUpdatePrivacy,
}) => {
  const [civicPreferences, setCivicPreferences] = useState<ProfilePreference[]>(profileData.civicPreferences);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference[]>(profileData.notificationPreferences);
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>(profileData.privacySettings);
  const [animatedStrength, setAnimatedStrength] = useState(0);
  const [animatedCompletion, setAnimatedCompletion] = useState(0);

  const pageRef = useRef<HTMLDivElement>(null);
  const strengthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.animate-entry'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }

    gsap.to({ strength: 0 }, {
      strength: profileData.profileStrength,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        setAnimatedStrength(Math.round(this.targets()[0].strength));
      },
    });

    gsap.to({ completion: 0 }, {
      completion: profileData.completionPercentage,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: function() {
        setAnimatedCompletion(Math.round(this.targets()[0].completion));
      },
    });
  }, [profileData]);

  const togglePreference = (id: string) => {
    const updated = civicPreferences.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    setCivicPreferences(updated);
    onUpdatePreferences?.(updated);
  };

  const toggleNotification = (id: string) => {
    const updated = notificationPrefs.map((n) =>
      n.id === id ? { ...n, enabled: !n.enabled } : n
    );
    setNotificationPrefs(updated);
    onUpdateNotifications?.(updated);
  };

  const updatePrivacySetting = (id: string, value: PrivacySetting['value']) => {
    const updated = privacySettings.map((s) =>
      s.id === id ? { ...s, value } : s
    );
    setPrivacySettings(updated);
    onUpdatePrivacy?.(updated);
  };

  const completedItems = profileData.completionItems.filter((item) => item.completed).length;
  const totalItems = profileData.completionItems.length;

  return (
    <div ref={pageRef} className="min-h-screen bg-[#FBFBFA]">
      <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between gap-4 animate-entry">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <User className="w-4 h-4" />
                <span>CIVIC IDENTITY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight font-serif">
                Profile Optimization
              </h1>
              <p className="text-xs text-[#6B7280] mt-1">
                Manage your civic identity, preferences, and privacy settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#0F1E36]">Profile Identity</h3>
                <button className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                  <Edit3 className="w-4 h-4 text-[#6B7280]" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-[#0F1E36] text-white flex items-center justify-center text-xl font-bold">
                  {profileData.identity.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold text-[#0F1E36]">{profileData.identity.fullName}</p>
                  <p className="text-xs text-[#6B7280]">{profileData.identity.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#6B7280]">Location</p>
                    <p className="text-xs font-semibold text-[#111827] truncate">
                      {profileData.identity.locality}, {profileData.identity.ward}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
                  <Building className="w-4 h-4 text-purple-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#6B7280]">Residence Type</p>
                    <p className="text-xs font-semibold text-[#111827] capitalize">
                      {profileData.identity.residenceType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#6B7280]">Community</p>
                    <p className="text-xs font-semibold text-[#111827] truncate">
                      {profileData.identity.societyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#6B7280]">Member Since</p>
                    <p className="text-xs font-semibold text-[#111827]">
                      {profileData.identity.joinedDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getVerificationBadgeColor(profileData.identity.verificationStatus)}`}>
                  {profileData.identity.verificationStatus === 'verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {profileData.identity.verificationStatus === 'pending' && <AlertCircle className="w-3.5 h-3.5" />}
                  <span className="capitalize">{profileData.identity.verificationStatus}</span>
                </div>
              </div>
            </div>

            <div ref={strengthRef} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#0F1E36]">Profile Strength</h3>
                <span className="text-xs font-semibold text-blue-600">
                  {getProfileStrengthLabel(animatedStrength)}
                </span>
              </div>

              <div className="relative mb-4">
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#2563EB"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(animatedStrength / 100) * 352} 352`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold font-mono text-[#0F1E36]">{animatedStrength}%</span>
                      <span className="text-[10px] text-[#6B7280]">Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {profileData.completionItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#D1D5DB]" />
                    )}
                    <span className={`text-xs ${item.completed ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B7280]">{completedItems} of {totalItems} items completed</span>
                  <span className="font-mono font-semibold text-[#0F1E36]">{animatedCompletion}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-[#0F1E36]">Contribution Summary</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F9FAFB] text-center">
                  <p className="text-2xl font-bold font-mono text-[#0F1E36]">
                    {profileData.contributionSummary.totalReports}
                  </p>
                  <p className="text-[10px] text-[#6B7280]">Total Reports</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-center">
                  <p className="text-2xl font-bold font-mono text-emerald-600">
                    {profileData.contributionSummary.verifiedReports}
                  </p>
                  <p className="text-[10px] text-emerald-700">Verified</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 text-center">
                  <p className="text-2xl font-bold font-mono text-blue-600">
                    {profileData.contributionSummary.communityConfirmations}
                  </p>
                  <p className="text-[10px] text-blue-700">Confirmations</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 text-center">
                  <p className="text-2xl font-bold font-mono text-purple-600">
                    {profileData.contributionSummary.impactPoints}
                  </p>
                  <p className="text-[10px] text-purple-700">Impact Points</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0F1E36]">Civic Preferences</h2>
                  <p className="text-xs text-[#6B7280]">Select categories you want to receive alerts for</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {civicPreferences.map((pref) => (
                  <div
                    key={pref.id}
                    onClick={() => togglePreference(pref.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      pref.enabled
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      pref.enabled ? 'bg-blue-100 text-blue-600' : 'bg-white text-[#6B7280]'
                    }`}>
                      {getPreferenceIcon(pref.icon)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${pref.enabled ? 'text-[#0F1E36]' : 'text-[#6B7280]'}`}>
                        {pref.label}
                      </p>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                      pref.enabled ? 'bg-blue-600' : 'bg-[#D1D5DB]'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        pref.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-[#0F1E36]">Notification Preferences</h2>
              </div>

              <div className="space-y-3">
                {notificationPrefs.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
                      {getNotificationIcon(notif.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111827]">{notif.label}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{notif.description}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(notif.id)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                        notif.enabled ? 'bg-blue-600' : 'bg-[#D1D5DB]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        notif.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-bold text-[#0F1E36]">Privacy Controls</h2>
              </div>

              <div className="space-y-4">
                {privacySettings.map((setting) => (
                  <div key={setting.id} className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
                        {getPrivacyIcon(setting.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111827]">{setting.label}</p>
                        <p className="text-xs text-[#6B7280]">{setting.description}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {(['public', 'community', 'private'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => updatePrivacySetting(setting.id, option)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            setting.value === option
                              ? 'bg-[#0F1E36] text-white'
                              : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Privacy-First Design</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Your personal information is never exposed publicly. Location data is always 
                      anonymized before being shown on the civic map.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOptimizationPage;
