import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MapPin,
  Clock,
  Compass,
  FileQuestion,
  Edit2,
  Check,
  X,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';
import { ExtractedSignalMetadata, ContextualRiskFactor } from '../../services/signalAnalysisService';

interface StructuredSignalCardProps {
  metadata: ExtractedSignalMetadata | null;
  onUpdateMetadata: (updated: Partial<ExtractedSignalMetadata>) => void;
}

export const StructuredSignalCard: React.FC<StructuredSignalCardProps> = ({
  metadata,
  onUpdateMetadata,
}) => {
  // Field editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showFactorsBreakdown, setShowFactorsBreakdown] = useState(false);

  // Fallback defaults matching CiviNest specification if analysis is loading/uninitialized
  const category = metadata?.subcategory || metadata?.categoryLabel || 'Street Lighting';
  const specificIssue = metadata?.specificIssue || metadata?.issueType || 'Streetlight failure (No power)';
  const preciseLocation = metadata?.preciseLocation || 'Near Gate 2, Dharampeth High School';
  const duration = metadata?.duration || '3 Days (approx. 72 hours)';
  const severity = metadata?.severity?.toUpperCase() || 'HIGH';
  const confidence = metadata?.confidence || 91;
  const severityReason =
    metadata?.severityReason ||
    'Elevated severity due to proximity to a school zone. Unlit areas near educational institutions increase vulnerability risk factors during early morning/evening hours.';

  const handleStartEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSaveEdit = (field: string) => {
    if (field === 'category') {
      onUpdateMetadata({ subcategory: tempValue, categoryLabel: tempValue });
    } else if (field === 'specificIssue') {
      onUpdateMetadata({ specificIssue: tempValue, issueType: tempValue });
    } else if (field === 'preciseLocation') {
      onUpdateMetadata({ preciseLocation: tempValue });
    } else if (field === 'duration') {
      onUpdateMetadata({ duration: tempValue });
    } else if (field === 'severity') {
      const sev = tempValue.toLowerCase() as 'low' | 'medium' | 'high' | 'critical';
      onUpdateMetadata({
        severity: sev,
        severityLabel: `${tempValue} Priority`,
      });
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const contextualFactors: ContextualRiskFactor[] = metadata?.contextualFactors || [
    {
      factor: 'Educational Zone Proximity',
      impact: 'High',
      description: 'Located within 50m of school pedestrian ingress route.',
    },
    {
      factor: 'Vulnerability Window',
      impact: 'High',
      description: 'High footfall during 06:30-08:00 and 18:00-20:00 student transit hours.',
    },
    {
      factor: 'Grid Cascade Risk',
      impact: 'Medium',
      description: 'Phase circuit covers 3 contiguous luminaire poles.',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-7 shadow-xs text-left space-y-6">
      {/* Header with Icon, Title, and Confidence Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F1E36] text-white flex items-center justify-center shadow-xs">
            <Code2 className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F1E36] tracking-tight">
              CiviNest Understood
            </h2>
            <p className="text-xs text-[#64748B] font-medium">Structured Semantic Extraction</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>High Confidence ({confidence}%)</span>
        </div>
      </div>

      {/* Structured Fields Grid (2x2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {/* 1. Category */}
        <div className="relative group p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              CATEGORY
            </span>
            {editingField !== 'category' && (
              <button
                type="button"
                onClick={() => handleStartEdit('category', category)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-[#0F1E36] transition-opacity cursor-pointer"
                title="Edit category"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {editingField === 'category' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-[#0F1E36] bg-white border border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSaveEdit('category')}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-bold text-[#0F1E36]">{category}</span>
            </div>
          )}
        </div>

        {/* 2. Specific Issue */}
        <div className="relative group p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              SPECIFIC ISSUE
            </span>
            {editingField !== 'specificIssue' && (
              <button
                type="button"
                onClick={() => handleStartEdit('specificIssue', specificIssue)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-[#0F1E36] transition-opacity cursor-pointer"
                title="Edit specific issue"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {editingField === 'specificIssue' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-[#0F1E36] bg-white border border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSaveEdit('specificIssue')}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="text-sm sm:text-base font-bold text-[#0F1E36]">{specificIssue}</span>
            </div>
          )}
        </div>

        {/* 3. Precise Location */}
        <div className="relative group p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              PRECISE LOCATION
            </span>
            {editingField !== 'preciseLocation' && (
              <button
                type="button"
                onClick={() => handleStartEdit('preciseLocation', preciseLocation)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-[#0F1E36] transition-opacity cursor-pointer"
                title="Edit precise location"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {editingField === 'preciseLocation' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-[#0F1E36] bg-white border border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSaveEdit('preciseLocation')}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#1E293B] leading-snug">
                {preciseLocation}
              </span>
            </div>
          )}
        </div>

        {/* 4. Duration */}
        <div className="relative group p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              DURATION
            </span>
            {editingField !== 'duration' && (
              <button
                type="button"
                onClick={() => handleStartEdit('duration', duration)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-[#0F1E36] transition-opacity cursor-pointer"
                title="Edit duration"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {editingField === 'duration' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-[#0F1E36] bg-white border border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSaveEdit('duration')}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#1E293B]">{duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Severity Section matching reference */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-extrabold tracking-wider uppercase text-rose-900">
              CONTEXTUAL SEVERITY: {severity}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowFactorsBreakdown(!showFactorsBreakdown)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            <span>Why this severity?</span>
            {showFactorsBreakdown ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <p className="text-xs text-rose-950/90 leading-relaxed pl-6">
          {severityReason}
        </p>

        {/* Expandable Contextual Factors Breakdown */}
        {showFactorsBreakdown && (
          <div className="pt-3 mt-3 border-t border-rose-200/70 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Spatial Risk Multipliers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {contextualFactors.map((cf, idx) => (
                <div key={idx} className="p-2.5 bg-white/80 rounded-xl border border-rose-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F1E36] text-[11px] truncate">
                      {cf.factor}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      {cf.impact}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B] leading-normal">{cf.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
