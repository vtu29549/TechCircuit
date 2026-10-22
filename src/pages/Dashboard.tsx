import React from 'react';
import {
  FileCheck2,
  BookMarked,
  FileSpreadsheet,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  ChevronRight,
  Search,
} from 'lucide-react';
import { BrandProfile, ReviewRecord } from '../types';

interface DashboardProps {
  brands: BrandProfile[];
  reviews: ReviewRecord[];
  onNavigate: (tab: string) => void;
  onLaunchDemo: () => void;
  onSelectReview: (review: ReviewRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  brands,
  reviews,
  onNavigate,
  onLaunchDemo,
  onSelectReview,
}) => {
  // Real metrics calculated from actual saved reviews
  const totalReviews = reviews.length;
  const compliantReviews = reviews.filter(
    (r) =>
      (r.analysis?.score || 0) >= 80 &&
      !r.analysis?.hasCriticalBlocker &&
      (r.analysis?.issueCounts?.critical || 0) === 0
  ).length;
  const flaggedReviews = reviews.filter(
    (r) =>
      r.analysis?.hasCriticalBlocker ||
      (r.analysis?.issueCounts?.critical || 0) > 0 ||
      (r.analysis?.issueCounts?.high || 0) > 0 ||
      (r.analysis?.score || 0) < 80
  ).length;
  const pendingApprovals = reviews.filter(
    (r) => r.approvalStatus === 'Pending Review'
  ).length;

  const averageScore =
    totalReviews > 0
      ? Math.round(
          reviews.reduce((acc, r) => acc + (r.analysis?.score || 0), 0) /
            totalReviews
        )
      : 0;

  const recentReviews = reviews.slice(0, 6);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Demo Workflow Banner for Judges & First-Time Users */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
              Interactive Hackathon Demo
            </span>
            <span className="text-xs text-slate-400">
              End-to-End Governance Workflow
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Verify Content Against NovaTech Guidelines
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Test the sample copy: <span className="font-mono text-teal-200">"Get 100% guaranteed results with our new solution. Sign up today."</span> Watch BrandGuard AI catch the prohibited phrase and missing disclaimer, suggest a compliant rewrite, and enforce approval gates.
          </p>
        </div>

        <button
          onClick={onLaunchDemo}
          className="shrink-0 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Launch Demo Workflow</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Stats Row (Calculated from actual database data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Reviews</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalReviews}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Active brand campaigns analyzed
          </div>
        </div>

        {/* Compliant Reviews */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Compliant Reviews</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {compliantReviews}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Score ≥ 80 with 0 critical blockers
          </div>
        </div>

        {/* Flagged Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Flagged Content</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-rose-600">
            {flaggedReviews}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Requires revision before publishing
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-600">
            {pendingApprovals}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Awaiting authorized sign-off
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('new-review')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-sm transition-all text-left group flex items-start gap-3.5"
        >
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              New Content Review
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste marketing draft to run deterministic & Gemini compliance checks.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('guidelines')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all text-left group flex items-start gap-3.5"
        >
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Brand Guidelines Manager
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure brand voice, prohibited phrases, approved terms, & disclaimers.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all text-left group flex items-start gap-3.5"
        >
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Compliance Reports
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Export comprehensive CSV audit dumps and generate printable certificates.
            </p>
          </div>
        </button>
      </div>

      {/* Review History Table with Real Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Recent Content Compliance Reviews
            </h3>
            <p className="text-xs text-slate-500">
              Real-time audit log of reviewed marketing campaigns
            </p>
          </div>

          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Audit History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentReviews.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No reviews saved yet. Click "New Content Review" to run your first compliance check.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Campaign & Content</th>
                  <th className="py-2.5 px-4 font-semibold">Brand Profile</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Score</th>
                  <th className="py-2.5 px-4 font-semibold">Issues Detected</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Audited Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReviews.map((rev) => {
                  const score = rev.analysis?.score || 0;
                  const hasCrit =
                    rev.analysis?.hasCriticalBlocker ||
                    (rev.analysis?.issueCounts?.critical || 0) > 0;
                  const totalIss = rev.analysis?.issueCounts?.total || 0;

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {rev.campaignName}
                        </div>
                        <div className="text-slate-500 text-[11px] capitalize">
                          {rev.contentType.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {rev.brandName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            hasCrit
                              ? 'bg-rose-100 text-rose-800'
                              : score >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {score}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">
                          {totalIss === 0 ? (
                            <span className="text-emerald-600 font-medium">
                              0 violations
                            </span>
                          ) : (
                            <span className="font-mono">
                              {rev.analysis?.issueCounts?.critical || 0} crit /{' '}
                              {rev.analysis?.issueCounts?.high || 0} high
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                            rev.approvalStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : rev.approvalStatus === 'Needs Revision'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : rev.approvalStatus === 'Pending Review'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {rev.approvalStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectReview(rev)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                        >
                          Open Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
