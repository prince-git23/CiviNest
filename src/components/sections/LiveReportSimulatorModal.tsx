import React, { useState } from 'react';
import { X, Send, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';

interface LiveReportSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignalAdded?: (text: string) => void;
}

export const LiveReportSimulatorModal: React.FC<LiveReportSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSignalAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'citizen' | 'admin'>('citizen');
  const [reportText, setReportText] = useState('');
  const [location, setLocation] = useState('Sector 14 — Downtown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: string;
    cluster: string;
    confidence: number;
    priority: number;
    piiCleaned: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleSimulateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    setIsProcessing(true);
    setSimulationResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      setSimulationResult({
        status: 'Merged into Active Cluster',
        cluster: 'Infrastructure Hazard #8842',
        confidence: 93,
        priority: 89,
        piiCleaned: true,
      });
      if (onSignalAdded) {
        onSignalAdded(reportText);
      }
    }, 1200);
  };

  const sampleReports = [
    'Streetlight on corner of 4th and Elm is broken, pitch black at night.',
    'Deep pothole right after the bus stop on Oak Avenue, almost hit my wheel.',
    'Fire hydrant valve dripping dirty water onto the sidewalk for 2 days.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <CiviNestLogo size={32} />
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200 mb-6 text-sm font-medium">
          <button
            onClick={() => {
              setActiveTab('citizen');
              setSimulationResult(null);
            }}
            className={`pb-3 px-4 transition-colors relative ${
              activeTab === 'citizen'
                ? 'text-[#0F1E36] font-semibold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Citizen Signal Intake
            {activeTab === 'citizen' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F1E36]" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setSimulationResult(null);
            }}
            className={`pb-3 px-4 transition-colors relative ${
              activeTab === 'admin'
                ? 'text-[#0F1E36] font-semibold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Municipal Access
            {activeTab === 'admin' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F1E36]" />
            )}
          </button>
        </div>

        {activeTab === 'citizen' ? (
          <div>
            <p className="text-xs text-gray-500 mb-4 font-normal">
              Test how CiviNest takes unstructured citizen input, automatically redacts PII, and clusters it into verified municipal intelligence.
            </p>

            <form onSubmit={handleSimulateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-600 mb-1.5 uppercase">
                  Describe Civic Issue / Hazard
                </label>
                <textarea
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Streetlight out for 3 days on Elm Street, very dark for evening walkers..."
                  className="w-full text-sm p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0F1E36] font-sans"
                />
              </div>

              {/* Sample Prompts */}
              <div>
                <span className="text-[11px] text-gray-500 block mb-1.5">Or try a sample signal:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleReports.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReportText(s)}
                      className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md text-left truncate max-w-full"
                    >
                      {s.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-gray-500 mb-1">
                    Ingestion Ward
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-gray-300 bg-white"
                  >
                    <option>Sector 14 — Downtown & Main</option>
                    <option>Sector 09 — West Ridge</option>
                    <option>Sector 03 — Harbor Ave</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isProcessing || !reportText.trim()}
                    className="w-full bg-[#0F1E36] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Ingest Signal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Simulation Result Box */}
            {simulationResult && (
              <div className="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{simulationResult.status}</span>
                  </span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                    Confidence: {simulationResult.confidence}%
                  </span>
                </div>
                <p className="text-xs text-blue-950 font-medium">
                  {simulationResult.cluster} ({location})
                </p>
                <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-800 font-mono">
                  <span>✓ PII Cryptographically Redacted</span>
                  <span className="text-red-700 font-semibold">Priority {simulationResult.priority}/100</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-sm text-gray-700">
            <p className="text-xs text-gray-500">
              Government and municipal triage portal. Single Sign-On with municipal OAuth credentials.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-gray-600 mb-1">Official Municipal Email</label>
                <input
                  type="email"
                  defaultValue="a.rivera@citygov.org"
                  className="w-full text-xs p-2.5 rounded border border-gray-300 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-600 mb-1">Assigned Department</label>
                <input
                  type="text"
                  defaultValue="Department of Public Works & Emergency Dispatch"
                  className="w-full text-xs p-2.5 rounded border border-gray-300 bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="w-full bg-[#0F1E36] text-white py-2.5 rounded-lg text-xs font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <span>Launch Municipal Command Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveReportSimulatorModal;
