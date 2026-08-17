import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { BrainCircuit, Loader2, AlertTriangle, RefreshCw, MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { getResidentInsights, AIInsightData } from '../../services/api';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<AIInsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { insights } = await getResidentInsights();
      setInsights(insights);
    } catch (err: any) {
      setError(err?.message || 'Unable to load insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!loading && listRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          listRef.current.querySelectorAll('.insight-card'),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
        );
      }, listRef);
      return () => ctx.revert();
    }
  }, [loading]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-1 mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">AI Insights</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
          Civic intelligence for your area
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Trends and signals detected across your locality, ward, and nearby civic issues.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-[#6B7280]">Loading insights...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
          <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1E36] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : insights.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 text-center">
          <BrainCircuit className="w-8 h-8 mx-auto text-[#9CA3AF]" />
          <p className="mt-3 text-sm font-semibold text-[#111827]">No insights yet</p>
          <p className="text-xs text-[#6B7280] mt-1">
            As more civic signals are processed in your area, trends will appear here.
          </p>
        </div>
      ) : (
        <div ref={listRef} className="space-y-4">
          {insights.map((insight, idx) => {
            const up = insight.trendPercentage >= 0;
            return (
              <div
                key={`${insight.category}-${idx}`}
                className="insight-card bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F1E36] flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                        {insight.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F1E36] leading-snug">{insight.title}</h3>
                    <p className="text-sm text-[#4B5563] mt-1.5">{insight.description}</p>
                  </div>
                  <div
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold border ${
                      up ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {up ? '+' : ''}{insight.trendPercentage}%
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-[#F1F5F9]">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <MapPin className="w-3.5 h-3.5" />
                    {insight.locality || 'Your locality'} · {insight.ward}
                  </span>
                  {insight.confidence != null && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      Confidence {Math.round(insight.confidence * 100)}%
                    </span>
                  )}
                  <Link
                    to="/resident/explore"
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    Explore affected area →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InsightsPage;
