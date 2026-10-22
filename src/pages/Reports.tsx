import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  Layers,
  CheckCircle2,
  AlertOctagon,
  FileText,
} from 'lucide-react';
import { ReviewRecord } from '../types';
import { ReportModal } from '../components/ReportModal';

interface ReportsProps {
  reviews: ReviewRecord[];
  onExportAllCsv: () => void;
}

export const Reports: React.FC<ReportsProps> = ({
  reviews,
  onExportAllCsv,
}) => {
  const [selectedReviewForModal, setSelectedReviewForModal] =
    useState<ReviewRecord | null>(null);
  const [filterBrand, setFilterBrand] = useState('all');

  const uniqueBrands = Array.from(new Set(reviews.map((r) => r.brandName)));

  const filtered = reviews.filter((r) => {
    if (filterBrand !== 'all' && r.brandName !== filterBrand) return false;
    return true;
  });

  const totalReviews = filtered.length;
  const approvedCount = filtered.filter((r) => r.approvalStatus === 'Approved').length;
  const criticalCount = filtered.reduce(
    (acc, r) => acc + (r.analysis?.issueCounts?.critical || 0),
    0
  );
  const avgScore =
    totalReviews > 0
      ? Math.round(
          filtered.reduce((acc, r) => acc + (r.analysis?.score || 0), 0) /
            totalReviews
        )
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Compliance Reporting & Audit Center
            </h2>
            <p className="text-xs text-slate-500">
              Generate governance reports, export tabular audit data, and review compliance trends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportAllCsv}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span>Download Tabular Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Audited Campaigns</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {totalReviews}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Average Compliance Score</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-700 mt-1">
            {avgScore} / 100
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Fully Approved Campaigns</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {approvedCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Critical Violations Prevented</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 mt-1">
            {criticalCount}
          </div>
        </div>
      </div>

      {/* Campaign Reports List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Campaign Compliance Dossiers
            </h3>
            <p className="text-xs text-slate-500">
              Click "View Report" to inspect complete findings, rule violations, and certificate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left">
              <tr>
                <th className="py-3 px-4 font-semibold">Campaign</th>
                <th className="py-3 px-4 font-semibold">Brand</th>
                <th className="py-3 px-4 font-semibold text-center">Score</th>
                <th className="py-3 px-4 font-semibold">Governance Status</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Individual Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {rev.campaignName}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{rev.brandName}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        rev.analysis?.hasCriticalBlocker
                          ? 'bg-rose-100 text-rose-800'
                          : (rev.analysis?.score || 0) >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.analysis?.score || 0}
                    </span>
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
                      onClick={() => setSelectedReviewForModal(rev)}
                      className="px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>View Dossier</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Report Modal */}
      {selectedReviewForModal && (
        <ReportModal
          isOpen={!!selectedReviewForModal}
          onClose={() => setSelectedReviewForModal(null)}
          review={selectedReviewForModal}
        />
      )}
    </div>
  );
};
