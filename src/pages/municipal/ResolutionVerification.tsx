import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  FileText,
  RefreshCw,
  Upload,
} from 'lucide-react';
import {
  getMunicipalIssues,
  getMunicipalResolutionState,
  submitMunicipalResolution,
  reopenMunicipalIssue,
  type MunicipalIssue,
} from '../../services/municipalApi';

type TabId = 'pending' | 'awaiting' | 'reopened';

export const ResolutionVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('pending');
  const [issues, setIssues] = useState<MunicipalIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMunicipalIssues({ limit: 100, sort: 'latest' });
      setIssues(res.issues);
    } catch (e: any) {
      setError(e?.message || 'Failed to load resolution cases.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = issues.filter((i) => i.status === 'In Progress');
  const awaiting = issues.filter((i) => i.status === 'Verification');
  const reopened = issues.filter((i) => i.status === 'Reopened');

  const tabs: { id: TabId; label: string; count: number; icon?: React.ReactNode }[] = [
    { id: 'pending', label: 'Pending Resolution', count: pending.length },
    { id: 'awaiting', label: 'Awaiting Verification', count: awaiting.length },
    { id: 'reopened', label: 'Reopened', count: reopened.length, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ];

  const filteredCases = activeTab === 'pending' ? pending : activeTab === 'awaiting' ? awaiting : reopened;

  const handleSubmitResolution = async (issue: MunicipalIssue) => {
    const desc = window.prompt(`Resolution description for ${issue.reportNumber} (what was done?):`);
    if (!desc) return;
    setBusy(issue.id);
    setMessage(null);
    try {
      await submitMunicipalResolution(issue.id, { description: desc });
      setMessage(`Resolution submitted for ${issue.reportNumber} — awaiting resident verification.`);
      await load();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to submit resolution.');
    } finally {
      setBusy(null);
    }
  };

  const handleReopen = async (issue: MunicipalIssue) => {
    const reason = window.prompt(`Reason for reopening ${issue.reportNumber}:`);
    if (reason === null) return;
    setBusy(issue.id);
    setMessage(null);
    try {
      await reopenMunicipalIssue(issue.id, reason || '');
      setMessage(`Issue ${issue.reportNumber} reopened.`);
      await load();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to reopen issue.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Resolution & Verification</h1>
          <p className="text-sm text-[#6B7280] mt-2 max-w-2xl">
            Track the final lifecycle stages of municipal interventions. Review department actions, examine submitted evidence, and monitor citizen sign-offs.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E293B] rounded-lg hover:bg-[#0F172A] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs ${message.startsWith('Failed') || message.includes('failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {message}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-[#1E293B] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/50'
            }`}
          >
            {tab.icon && <span className={activeTab === tab.id ? 'text-white' : 'text-[#9CA3AF]'}>{tab.icon}</span>}
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : tab.id === 'reopened' ? 'bg-red-100 text-red-700' : 'bg-white text-[#6B7280]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Cases List ── */}
      <div className="space-y-4">
        {loading && <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center text-sm text-[#6B7280]">Loading cases...</div>}
        {!loading && error && <div className="bg-white rounded-xl border border-red-200 p-12 text-center text-sm text-red-600">{error}</div>}
        {!loading && !error &&
          filteredCases.map((issue) => <CaseCard key={issue.id} issue={issue} busy={busy === issue.id} onSubmit={() => handleSubmitResolution(issue)} onReopen={() => handleReopen(issue)} />)}
        {!loading && !error && filteredCases.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <p className="text-sm text-[#6B7280]">No cases in this category at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Case Card Component ──

const CaseCard: React.FC<{ issue: MunicipalIssue; busy: boolean; onSubmit: () => void; onReopen: () => void }> = ({ issue, busy, onSubmit, onReopen }) => {
  const [resolution, setResolution] = useState<{ verificationState: string; resolution: any } | null>(null);

  useEffect(() => {
    let active = true;
    getMunicipalResolutionState(issue.id)
      .then((r) => {
        if (active) setResolution({ verificationState: r.verificationState, resolution: r.resolution });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [issue.id]);

  const steps = [
    { label: 'Reported', done: true, time: issue.reportedAt ? new Date(issue.reportedAt).toLocaleDateString() : '' },
    { label: 'Assigned', done: !!issue.assignedAt, time: issue.assignedAt ? new Date(issue.assignedAt).toLocaleDateString() : '' },
    { label: 'In Progress', done: issue.status !== 'Under Review', current: issue.status === 'In Progress', time: issue.status === 'In Progress' ? 'Ongoing' : '' },
    { label: 'Citizen Verified', done: issue.status === 'Resolved', current: issue.status === 'Verification', time: issue.status === 'Verification' ? 'Pending' : '' },
  ];

  const progressWidth = issue.status === 'Reopened' ? '75%' : issue.status === 'Verification' ? '100%' : issue.status === 'In Progress' ? '60%' : '40%';

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Left: Case Info */}
        <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-[#E5E7EB]">
          <div className="flex items-start justify-between mb-4">
            <span className="inline-flex px-2.5 py-1 bg-[#F3F4F6] rounded-lg text-xs font-mono font-semibold text-[#6B7280] border border-[#E5E7EB]">
              {issue.reportNumber}
              {issue.clusterCode ? ` · ${issue.clusterCode}` : ''}
            </span>
            <span
              className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                issue.status === 'Reopened'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : issue.status === 'Verification'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {issue.status}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#111827] mb-2">{issue.title}</h3>
          <p className="text-sm text-[#6B7280] mb-4">
            {issue.location.ward}
            {issue.location.locality ? `, ${issue.location.locality}` : ''}
            {issue.location.city ? `, ${issue.location.city}` : ''}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-[#374151]">{issue.department || 'Unassigned'}</span>
            {issue.assignedTeam && <span className="text-xs text-[#9CA3AF]">· {issue.assignedTeam}</span>}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" />
            <span>Priority {issue.priorityScore}/100 · {issue.reportCount} reports · {issue.confirmationCount} confirmations</span>
          </div>

          <div className="mt-4 w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${issue.status === 'Reopened' ? 'bg-red-500' : issue.status === 'Verification' ? 'bg-blue-500' : 'bg-[#1E293B]'}`}
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        {/* Right: Resolution Progress */}
        <div className="lg:col-span-3 p-6">
          <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-5">Resolution Progress</h4>

          <div className="flex items-start justify-between mb-6">
            {steps.map((step, i) => (
              <div key={step.label} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.done ? 'bg-[#1E293B] border-[#1E293B]' : step.current ? 'bg-white border-[#1E293B]' : 'bg-white border-[#D1D5DB]'
                    }`}
                  >
                    {step.done ? <CheckCircle2 className="w-5 h-5 text-white" /> : step.current ? <div className="w-3 h-3 rounded-full bg-[#1E293B]" /> : <div className="w-3 h-3 rounded-full bg-[#D1D5DB]" />}
                  </div>
                  <span className={`text-xs mt-2 text-center ${step.done || step.current ? 'font-semibold text-[#111827]' : 'text-[#9CA3AF]'}`}>{step.label}</span>
                  {step.time && <span className="text-[11px] text-[#9CA3AF] mt-0.5">{step.time}</span>}
                </div>
                {i < steps.length - 1 && <div className={`absolute top-5 left-1/2 w-full h-0.5 ${step.done ? 'bg-[#1E293B]' : 'bg-[#E5E7EB]'}`} />}
              </div>
            ))}
          </div>

          {/* Resolution + Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <h5 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Resolution</h5>
              {resolution?.resolution ? (
                <div>
                  <p className="text-sm text-[#374151] leading-relaxed">{resolution.resolution.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="w-7 h-7 rounded-full bg-[#1E293B] text-white text-[10px] font-bold flex items-center justify-center">
                      {(resolution.resolution.submittedBy || 'O').slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-[#111827]">{resolution.resolution.submittedBy}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{resolution.resolution.evidence?.length || 0} evidence items</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#6B7280]">No resolution submitted yet.</p>
              )}
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <h5 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Required Evidence</h5>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg bg-[#E5E7EB] flex items-center justify-center">
                  <Camera className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <div className="w-14 h-14 rounded-lg bg-[#E5E7EB] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#9CA3AF]" />
                </div>
              </div>
              {issue.status === 'In Progress' ? (
                <button
                  disabled={busy}
                  onClick={onSubmit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {busy ? 'Submitting...' : 'Upload Evidence & Submit Resolution'}
                </button>
              ) : issue.status === 'Verification' || issue.status === 'Resolved' ? (
                <button
                  disabled={busy}
                  onClick={onReopen}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {busy ? 'Reopening...' : 'Reopen Issue'}
                </button>
              ) : (
                <button
                  disabled={busy}
                  onClick={onReopen}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Reopen Issue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionVerification;
