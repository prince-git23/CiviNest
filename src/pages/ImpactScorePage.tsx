import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Award,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Camera,
  ShieldCheck,
  Users,
  ChevronRight,
  Lightbulb,
  Droplet,
  Car,
  Trash2,
  Shield,
  Radio,
  Clock,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import {
  ImpactScoreProfile,
  ImpactMetric,
  ImpactHistoryItem,
  ImpactContribution,
  ImpactTimelinePoint,
  ImpactBadge,
  defaultImpactProfile,
  calculateLevel,
} from '../services/impactScoreService';

interface ImpactScorePageProps {
  userContext?: {
    name: string;
    city: string;
    ward: string;
    community: string;
  };
  impactData?: ImpactScoreProfile;
  onNavigateToReports?: () => void;
  onNavigateToMap?: () => void;
}

const getMetricIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    FileCheck: <FileCheck className="w-5 h-5" />,
    CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
    Camera: <Camera className="w-5 h-5" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5" />,
    Users: <Users className="w-5 h-5" />,
  };
  return icons[iconName] || <Award className="w-5 h-5" />;
};

const getHistoryIcon = (type: ImpactHistoryItem['type']) => {
  switch (type) {
    case 'report_verified':
      return <FileCheck className="w-4 h-4" />;
    case 'issue_confirmed':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'evidence_contributed':
      return <Camera className="w-4 h-4" />;
    case 'resolution_verified':
      return <ShieldCheck className="w-4 h-4" />;
    case 'community_contribution':
      return <Users className="w-4 h-4" />;
    default:
      return <Award className="w-4 h-4" />;
  }
};

const getHistoryColor = (type: ImpactHistoryItem['type']) => {
  switch (type) {
    case 'report_verified':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'issue_confirmed':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'evidence_contributed':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'resolution_verified':
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'community_contribution':
      return 'bg-pink-50 text-pink-600 border-pink-100';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Street Lighting': <Lightbulb className="w-4 h-4" />,
    'Water Supply': <Droplet className="w-4 h-4" />,
    'Roads & Transport': <Car className="w-4 h-4" />,
    'Sanitation': <Trash2 className="w-4 h-4" />,
  };
  return icons[category] || <Shield className="w-4 h-4" />;
};

const getBadgeIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    Radio: <Radio className="w-5 h-5" />,
    Users: <Users className="w-5 h-5" />,
    Camera: <Camera className="w-5 h-5" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  };
  return icons[iconName] || <Award className="w-5 h-5" />;
};

export const ImpactScorePage: React.FC<ImpactScorePageProps> = ({
  userContext = {
    name: 'Prince',
    city: 'Nagpur',
    ward: 'Dharampeth Ward 14',
    community: 'Green Valley Residency',
  },
  impactData = defaultImpactProfile,
  onNavigateToReports,
  onNavigateToMap,
}) => {
  const [profile, setProfile] = useState<ImpactScoreProfile>(impactData);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedMetrics, setAnimatedMetrics] = useState<Record<string, number>>({});
  const pageRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.animate-entry'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      );
    }

    gsap.to({ score: 0 }, {
      score: profile.totalScore,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        setAnimatedScore(Math.round(this.targets()[0].score));
      },
    });

    const initialMetrics: Record<string, number> = {};
    profile.metrics.forEach((m) => {
      initialMetrics[m.id] = 0;
    });
    setAnimatedMetrics(initialMetrics);

    profile.metrics.forEach((metric, index) => {
      gsap.to({ value: 0 }, {
        value: metric.value,
        duration: 1.2,
        delay: 0.3 + index * 0.1,
        ease: 'power2.out',
        onUpdate: function() {
          setAnimatedMetrics((prev) => ({
            ...prev,
            [metric.id]: Math.round(this.targets()[0].value),
          }));
        },
      });
    });
  }, [profile]);

  const maxTimelinePoints = Math.max(...profile.timeline.map((t) => t.cumulative));

  return (
    <div ref={pageRef} className="min-h-screen bg-[#FBFBFA]">
      <div className="bg-gradient-to-br from-[#0F1E36] to-[#1E293B] text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="animate-entry">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-2">
                <Award className="w-4 h-4" />
                <span>CIVIC IMPACT SCORE</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-serif mb-3">
                Your Civic Contribution
              </h1>
              <p className="text-sm text-slate-300 max-w-md leading-relaxed">
                Your score reflects verified civic participation, useful evidence, issue confirmations, 
                resolution verification and meaningful community contributions.
              </p>
            </div>

            <div ref={scoreRef} className="flex flex-col items-center lg:items-end animate-entry">
              <div className="relative">
                <div className="text-7xl sm:text-8xl font-extrabold font-mono tracking-tight">
                  {animatedScore}
                </div>
                <div className="text-center lg:text-right mt-2">
                  <span className="text-sm font-semibold text-blue-300">points</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-xs text-slate-300">Level</span>
                  <p className="text-lg font-bold">{profile.level}</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-xs text-slate-300">Progress to Next</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full transition-all duration-1000"
                        style={{ width: `${profile.progressToNextLevel / 2.5}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono">{profile.progressToNextLevel}/250</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 animate-entry">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F1E36]">Contribution Dimensions</h2>
                  <p className="text-xs text-[#6B7280]">How your civic impact is calculated</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
                      >
                        {getMetricIcon(metric.icon)}
                      </div>
                      <span className="text-2xl font-bold font-mono text-[#0F1E36]">
                        {animatedMetrics[metric.id] ?? metric.value}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#111827]">{metric.label}</p>
                    <p className="text-[11px] text-[#6B7280] mt-1">{metric.description}</p>
                    <div className="mt-3 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${(metric.value / metric.maxValue) * 100}%`,
                          backgroundColor: metric.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 animate-entry">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F1E36]">Impact Timeline</h2>
                  <p className="text-xs text-[#6B7280]">Your contribution growth over time</p>
                </div>
              </div>

              <div ref={chartRef} className="h-40 relative">
                <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
                  {profile.timeline.map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-700"
                        style={{ 
                          height: `${(point.cumulative / maxTimelinePoints) * 120}px`,
                        }}
                      />
                      <span className="text-[10px] font-mono text-[#9CA3AF]">{point.points}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-8 border-t border-[#F3F4F6]">
                  {profile.timeline.map((point, index) => (
                    <span key={index} className="text-[10px] text-[#9CA3AF] flex-1 text-center">
                      {point.date}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 animate-entry">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0F1E36]">Impact History</h2>
                  <p className="text-xs text-[#6B7280]">Recent civic contributions</p>
                </div>
              </div>

              <div className="space-y-3">
                {profile.history.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getHistoryColor(item.type)}`}>
                        {getHistoryIcon(item.type)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                        <p className="text-[11px] text-[#6B7280]">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#9CA3AF]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.locality}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold font-mono text-emerald-600">+{item.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#0F1E36]">Community Impact</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB]">
                  <span className="text-xs text-[#6B7280]">Issues Influenced</span>
                  <span className="text-lg font-bold font-mono text-[#0F1E36]">
                    {profile.communityImpact.issuesInfluenced}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB]">
                  <span className="text-xs text-[#6B7280]">Verified Contributions</span>
                  <span className="text-lg font-bold font-mono text-[#0F1E36]">
                    {profile.communityImpact.verifiedContributions}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB]">
                  <span className="text-xs text-[#6B7280]">Resolutions Verified</span>
                  <span className="text-lg font-bold font-mono text-emerald-600">
                    {profile.communityImpact.resolutionsVerified}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB]">
                  <span className="text-xs text-[#6B7280]">Community Confirmations</span>
                  <span className="text-lg font-bold font-mono text-blue-600">
                    {profile.communityImpact.communityConfirmations}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[10px] text-blue-600 font-semibold">Local Rank</p>
                  <p className="text-2xl font-bold text-blue-700">#{profile.communityImpact.localRank}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-600 font-semibold">Ward Rank</p>
                  <p className="text-2xl font-bold text-slate-700">#{profile.communityImpact.wardRank}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-[#0F1E36]">Earned Badges</h3>
              </div>

              <div className="space-y-3">
                {profile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-xl border ${
                      badge.isRare 
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
                        : 'bg-[#F9FAFB] border-[#E5E7EB]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        badge.isRare ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {getBadgeIcon(badge.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#0F1E36]">{badge.name}</p>
                          {badge.isRare && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                              RARE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">{badge.description}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-1">Earned {badge.earnedAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-entry">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-[#0F1E36]">Contributions by Category</h3>
              </div>

              <div className="space-y-3">
                {profile.contributions.map((contrib) => (
                  <div key={contrib.category} className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${contrib.color}20`, color: contrib.color }}
                    >
                      {getCategoryIcon(contrib.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#111827]">{contrib.category}</p>
                        <span className="text-xs font-mono text-[#6B7280]">{contrib.count} reports</span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${(contrib.points / 200) * 100}%`,
                            backgroundColor: contrib.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactScorePage;
