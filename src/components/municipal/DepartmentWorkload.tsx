import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BarChart3, AlertCircle, Users, Activity, Clock } from 'lucide-react';
import { MunicipalDepartmentWorkload } from '../../types';

interface DepartmentWorkloadProps {
  workloads: MunicipalDepartmentWorkload[];
  onSelectDepartment?: (dept: MunicipalDepartmentWorkload) => void;
}

export const DepartmentWorkload: React.FC<DepartmentWorkloadProps> = ({
  workloads,
  onSelectDepartment,
}) => {
  const [hoveredDept, setHoveredDept] = useState<MunicipalDepartmentWorkload | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const maxCapacity = Math.max(...workloads.map((w) => Math.max(w.capacity, w.activeCases)), 200);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !chartContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.workload-bar-column', {
        scaleY: 0,
        transformOrigin: 'bottom',
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }, chartContainerRef);

    return () => ctx.revert();
  }, [workloads]);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#111827] tracking-tight font-sans">
          Department Workload
        </h3>
        <span className="text-[11px] font-mono font-medium text-slate-500">
          Capacity & Dispatch
        </span>
      </div>

      {/* Vertical Interactive Chart */}
      <div ref={chartContainerRef} className="pt-4 pb-2">
        <div className="h-44 flex items-end justify-between gap-3 sm:gap-4 px-2 border-b border-slate-200">
          {workloads.map((dept) => {
            const heightPercent = Math.min(100, Math.round((dept.activeCases / maxCapacity) * 100));
            const isOverloaded = dept.utilizationPercentage > 100;
            const isHovered = hoveredDept?.id === dept.id;

            return (
              <div
                key={dept.id}
                onMouseEnter={() => setHoveredDept(dept)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() => onSelectDepartment && onSelectDepartment(dept)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Value tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 px-2.5 py-1 bg-[#0F1E36] text-white rounded-lg text-[10px] font-mono whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
                    <p className="font-bold">{dept.department}</p>
                    <p className="text-slate-300">
                      {dept.activeCases} / {dept.capacity} ({dept.utilizationPercentage}%)
                    </p>
                  </div>
                )}

                {/* Case count tag */}
                <span className="text-[11px] font-mono font-bold text-[#111827] mb-1.5 opacity-80 group-hover:opacity-100 group-hover:text-[#2563EB] transition-colors">
                  {dept.activeCases}
                </span>

                {/* Bar Pillar */}
                <div className="w-full max-w-[36px] bg-[#F3F4F6] rounded-t-lg h-full flex items-end overflow-hidden">
                  <div
                    className={`workload-bar-column w-full rounded-t-lg transition-all duration-300 ${
                      isOverloaded
                        ? 'bg-[#DC2626]'
                        : isHovered
                        ? 'bg-[#2563EB]'
                        : 'bg-[#0F1E36]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagonal / Rotated Department Labels matching reference */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 px-2 pt-3">
          {workloads.map((dept) => (
            <div key={dept.id} className="flex-1 text-center">
              <span className="inline-block transform -rotate-45 origin-top-left text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider uppercase text-[#6B7280] group-hover:text-[#111827] transition-colors whitespace-nowrap">
                {dept.department}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hovered / Active Details Card */}
      <div className="mt-8 pt-4 border-t border-slate-100 text-xs">
        {hoveredDept ? (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827]">{hoveredDept.department} Operations</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  hoveredDept.slaRisk === 'critical'
                    ? 'bg-rose-100 text-rose-700'
                    : hoveredDept.slaRisk === 'moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                SLA RISK: {hoveredDept.slaRisk.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B7280]">
              <div>
                Utilization: <strong className="text-slate-800">{hoveredDept.utilizationPercentage}%</strong>
              </div>
              <div>
                Avg Response: <strong className="text-slate-800">{hoveredDept.avgResponseHours} hrs</strong>
              </div>
              <div>
                Active Crews: <strong className="text-slate-800">{hoveredDept.assignedTeamsCount}</strong>
              </div>
              <div>
                Standby Crews: <strong className="text-slate-800">{hoveredDept.availableTeamsCount}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Hover on columns to inspect unit telemetry</span>
            <span className="font-mono text-[10px]">5 DEPARTMENTS</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentWorkload;
