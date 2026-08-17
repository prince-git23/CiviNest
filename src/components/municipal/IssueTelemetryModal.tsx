import React from 'react';
import {
  X,
  Radio,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  Activity,
  AlertTriangle,
  User,
  Image as ImageIcon,
  CheckCircle2,
  Send,
  Zap,
} from 'lucide-react';
import { MunicipalIssueItem } from '../../types';
import { ConfidenceBadge } from './ConfidenceBadge';

interface IssueTelemetryModalProps {
  isOpen: boolean;
  issue: MunicipalIssueItem | null;
  onClose: () => void;
  onAssignTeam?: (issue: MunicipalIssueItem) => void;
}

export const IssueTelemetryModal: React.FC<IssueTelemetryModalProps> = ({
  isOpen,
  issue,
  onClose,
  onAssignTeam,
}) => {
  if (!isOpen || !issue) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Topbar */}
        <div className="px-6 py-4 bg-[#0F1E36] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
                  {issue.issueCode}
                </span>
                <h3 className="text-base font-bold font-sans truncate">{issue.title}</h3>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Full Municipal Telemetry & AI Diagnostic Stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">
                Priority Score
              </span>
              <span className="text-xl font-extrabold text-[#DC2626] font-sans">
                {issue.priorityScore} / 100
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">
                AI Confidence
              </span>
              <span className="text-xl font-extrabold text-[#0F1E36] font-sans">
                {issue.aiConfidence}%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">
                Citizen Signals
              </span>
              <span className="text-xl font-extrabold text-[#0F1E36] font-sans">
                {issue.reportCount} Verified
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">
                SLA Countdown
              </span>
              <span
                className={`text-xl font-extrabold font-mono ${
                  issue.isOverSla ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {issue.slaRemainingHours > 0
                  ? `${issue.slaRemainingHours}h Left`
                  : 'SLA BREACHED'}
              </span>
            </div>
          </div>

          {/* AI Cluster Correlation Rationale */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI SPATIAL SYNTHESIS ENGINE
              </span>
              <span>CONFIDENCE: {issue.aiConfidence}%</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {issue.aiRationale}
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Recommended Action: <strong className="text-white">{issue.recommendedAction}</strong></span>
            </div>
          </div>

          {/* IoT Sensor Telemetry (if available) */}
          {issue.sensorTelemetry && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <Activity className="w-4 h-4 text-blue-600" />
                  IOT GRID SENSOR TELEMETRY ({issue.sensorTelemetry.sensorId})
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                  LAST PING: {issue.sensorTelemetry.lastPing}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Telemetry Type</span>
                  <strong className="text-slate-800">{issue.sensorTelemetry.type}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Current Reading</span>
                  <strong className="text-rose-600 font-mono text-sm">{issue.sensorTelemetry.reading}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Nominal Baseline</span>
                  <strong className="text-slate-800 font-mono">{issue.sensorTelemetry.baseline}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Deviation Anomaly</span>
                  <strong className="text-rose-600 font-mono">{issue.sensorTelemetry.deviation}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Citizen Signal Evidence Feed */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-700 tracking-wider">
              Contributing Citizen Signals ({issue.contributingSignals.length})
            </h4>
            <div className="space-y-2">
              {issue.contributingSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-900">{sig.user}</span>
                    <span className="font-mono text-[10px]">{sig.time}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-sans">{sig.text}</p>
                  {sig.photosCount && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#2563EB] pt-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{sig.photosCount} Geo-tagged Photos Verified</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Coordinates & Location */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-600" />
              <div>
                <p className="font-bold text-slate-900">{issue.location.address}</p>
                <p className="text-[11px] text-slate-500">{issue.location.ward} · {issue.location.sector}</p>
              </div>
            </div>
            <div className="font-mono text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              GPS: {issue.location.coordinates.lat.toFixed(4)}, {issue.location.coordinates.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            Status: <strong className="text-slate-900">{issue.status}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
            {onAssignTeam && (
              <button
                onClick={() => {
                  onClose();
                  onAssignTeam(issue);
                }}
                className="px-4.5 py-2 bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{issue.assignedTeam ? 'Manage Team' : 'Assign Team'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueTelemetryModal;
