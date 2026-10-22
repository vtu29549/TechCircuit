import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Check,
  Sparkles,
  Binary,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { ComplianceIssue, Severity } from '../types';

interface IssueCardProps {
  issue: ComplianceIssue;
  onApplyCorrection?: (correction: string, originalText: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onApplyCorrection,
}) => {
  const [copied, setCopied] = React.useState(false);

  const getSeverityStyle = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-rose-200',
          bg: 'bg-rose-50/40',
          badge: 'bg-rose-100 text-rose-800 border border-rose-200',
          icon: AlertOctagon,
          iconColor: 'text-rose-600',
          label: 'Critical Violation',
        };
      case 'high':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/30',
          badge: 'bg-amber-100 text-amber-800 border border-amber-200',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          label: 'High Severity',
        };
      case 'medium':
        return {
          border: 'border-slate-200',
          bg: 'bg-white',
          badge: 'bg-slate-100 text-slate-800 border border-slate-200',
          icon: Info,
          iconColor: 'text-slate-500',
          label: 'Medium Severity',
        };
      case 'low':
      default:
        return {
          border: 'border-slate-200',
          bg: 'bg-white',
          badge: 'bg-slate-50 text-slate-600 border border-slate-200',
          icon: Info,
          iconColor: 'text-slate-400',
          label: 'Low Severity',
        };
    }
  };

  const style = getSeverityStyle(issue.severity);
  const IconComponent = style.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(issue.suggestedCorrection);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} p-4 shadow-sm transition-all hover:shadow`}
    >
      {/* Header bar: Severity + Source Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold ${style.badge}`}>
            <IconComponent className={`w-3.5 h-3.5 ${style.iconColor}`} />
            {style.label}
          </span>

          {/* Engine Source Badge */}
          {issue.source === 'deterministic' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Binary className="w-3 h-3 text-slate-500" />
              Deterministic Rule Match
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Contextual AI Assessment
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          {issue.type.replace('_', ' ')}
        </span>
      </div>

      {/* Violated Rule Title */}
      <h4 className="text-sm font-bold text-slate-900 mb-1">
        {issue.violatedRule}
      </h4>

      {/* Evidence snippet */}
      <div className="my-2.5 bg-slate-100/90 rounded-lg p-2.5 border border-slate-200/80 text-xs">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Exact Evidence Found:
        </div>
        <div className="font-mono text-rose-700 bg-white/80 px-2 py-1 rounded border border-rose-200 font-medium break-words">
          "{issue.exactText}"
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        {issue.explanation}
      </p>

      {/* Suggested Correction Box */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-emerald-700" />
            Recommended Correction:
          </div>
          <div className="font-medium text-slate-900">
            {issue.suggestedCorrection}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          {onApplyCorrection && (
            <button
              onClick={() => onApplyCorrection(issue.suggestedCorrection, issue.exactText)}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-950 bg-emerald-300 hover:bg-emerald-400 border border-emerald-400 rounded transition-colors"
            >
              Apply Correction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
