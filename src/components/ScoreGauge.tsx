import React from 'react';
import { AlertOctagon, CheckCircle2, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { ScoreBreakdown } from '../types';

interface ScoreGaugeProps {
  score: number;
  hasCriticalBlocker: boolean;
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  scoreBreakdown?: ScoreBreakdown;
  brandName: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  hasCriticalBlocker,
  issueCounts,
  scoreBreakdown,
  brandName,
}) => {
  // Determine color scheme
  let colorTheme = {
    ring: 'stroke-emerald-600',
    bgBadge: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    statusText: 'Brand Compliant',
    description: 'No configured rule violations detected against the active guidelines.',
  };

  if (hasCriticalBlocker) {
    colorTheme = {
      ring: 'stroke-rose-600',
      bgBadge: 'bg-rose-50 border-rose-200 text-rose-800',
      statusText: 'Critical Violation Blocker',
      description: 'Publication approval is hard-blocked due to unresolved critical severity issues.',
    };
  } else if (score < 60) {
    colorTheme = {
      ring: 'stroke-rose-600',
      bgBadge: 'bg-rose-50 border-rose-200 text-rose-800',
      statusText: 'Non-Compliant Draft',
      description: 'Multiple high-severity compliance deviations require resolution before approval.',
    };
  } else if (score < 85 || issueCounts.total > 0) {
    colorTheme = {
      ring: 'stroke-amber-500',
      bgBadge: 'bg-amber-50 border-amber-200 text-amber-800',
      statusText: 'Needs Revision',
      description: 'Guidelines deviations detected. Review recommended corrections.',
    };
  }

  // SVG circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Top section: Score and Status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Radial score meter */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`${colorTheme.ring} transition-all duration-700 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
                {score}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-medium">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${colorTheme.bgBadge}`}>
                {hasCriticalBlocker ? (
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                ) : score >= 85 && issueCounts.total === 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                {colorTheme.statusText}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 max-w-sm">
              {colorTheme.description}
            </p>
          </div>
        </div>

        {/* Issue Count Badges */}
        <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-center">
          <div className="px-2 py-1">
            <div className="text-[11px] text-slate-500 font-medium">Critical</div>
            <div className="text-sm font-bold font-mono tabular-nums text-rose-600">
              {issueCounts.critical}
            </div>
          </div>
          <div className="px-2 py-1 border-l border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">High</div>
            <div className="text-sm font-bold font-mono tabular-nums text-amber-600">
              {issueCounts.high}
            </div>
          </div>
          <div className="px-2 py-1 border-l border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Medium</div>
            <div className="text-sm font-bold font-mono tabular-nums text-slate-700">
              {issueCounts.medium}
            </div>
          </div>
          <div className="px-2 py-1 border-l border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Low</div>
            <div className="text-sm font-bold font-mono tabular-nums text-slate-500">
              {issueCounts.low}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Blocker Warning Banner if applicable */}
      {hasCriticalBlocker && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900 flex items-start gap-2.5">
          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Governance Blocker Active:</span> Even if overall copy clarity is high, the presence of {issueCounts.critical} critical violation(s) overrides numerical thresholds. Content cannot be submitted for approval until resolved.
          </div>
        </div>
      )}

      {/* Transparent Scoring Formula */}
      {scoreBreakdown && (
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Scoring Model: Base 100 - (Critical: -35 | High: -20 | Medium: -10 | Low: -5)
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded">
            {scoreBreakdown.formula}
          </div>
        </div>
      )}

      {/* Statutory & Legal Disclaimer */}
      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5">
        <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
        <span>
          Compliance checks are executed against "{brandName}" configured policies. BrandGuard AI does not certify legal, statutory, or financial regulatory compliance.
        </span>
      </div>
    </div>
  );
};
