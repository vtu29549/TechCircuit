import React, { useRef } from 'react';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  FileText,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { ReviewRecord } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewRecord;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  review,
}) => {
  if (!isOpen) return null;

  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const issues = review.analysis?.issues || [];
    const headers = [
      'Report ID',
      'Campaign Name',
      'Brand Name',
      'Content Type',
      'Compliance Score',
      'Approval Status',
      'Timestamp',
      'Issue ID',
      'Severity',
      'Category',
      'Source',
      'Exact Evidence',
      'Violated Rule',
      'Explanation',
      'Suggested Correction',
    ];

    const rows: string[][] = [];

    if (issues.length === 0) {
      rows.push([
        review.id,
        `"${review.campaignName.replace(/"/g, '""')}"`,
        `"${review.brandName.replace(/"/g, '""')}"`,
        review.contentType,
        String(review.analysis?.score || 100),
        review.approvalStatus,
        review.createdAt,
        'None',
        'None',
        'compliant',
        'deterministic_and_ai',
        'No violations detected',
        'No violations',
        'Meets all configured guidelines',
        'Ready for review',
      ]);
    } else {
      issues.forEach((iss) => {
        rows.push([
          review.id,
          `"${review.campaignName.replace(/"/g, '""')}"`,
          `"${review.brandName.replace(/"/g, '""')}"`,
          review.contentType,
          String(review.analysis?.score || 0),
          review.approvalStatus,
          review.createdAt,
          iss.id,
          iss.severity,
          iss.type,
          iss.source,
          `"${(iss.exactText || '').replace(/"/g, '""')}"`,
          `"${(iss.violatedRule || '').replace(/"/g, '""')}"`,
          `"${(iss.explanation || '').replace(/"/g, '""')}"`,
          `"${(iss.suggestedCorrection || '').replace(/"/g, '""')}"`,
        ]);
      });
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `BrandGuard_Compliance_Report_${review.id}_${review.brandName.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const score = review.analysis?.score || 0;
  const issues = review.analysis?.issues || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Executive Compliance & Audit Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Container */}
        <div
          ref={printableRef}
          className="p-8 space-y-6 overflow-y-auto text-slate-900 bg-white print:p-0"
        >
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  BrandGuard AI
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                  COMPLIANCE AUDIT CERTIFICATE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Content Governance & Pre-Publication Compliance Verification
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <div>Report ID: {review.id}</div>
              <div>Generated: {new Date(review.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Brand Profile</span>
              <span className="font-bold text-slate-900 text-sm">{review.brandName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Campaign Name</span>
              <span className="font-bold text-slate-900 text-sm">{review.campaignName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Content Type</span>
              <span className="font-medium text-slate-900 capitalize">
                {review.contentType.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Approval Status</span>
              <span
                className={`font-bold inline-block px-2 py-0.5 rounded text-[11px] ${
                  review.approvalStatus === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : review.approvalStatus === 'Needs Revision'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {review.approvalStatus}
              </span>
            </div>
          </div>

          {/* Compliance Score Block */}
          <div className="p-4 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Overall Compliance Score
              </div>
              <div className="text-3xl font-bold font-mono text-slate-900 mt-1">
                {score} <span className="text-sm font-normal text-slate-500">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {review.analysis?.scoreBreakdown?.scoringNotes || 'Audit complete.'}
              </p>
            </div>
            <div className="text-right text-xs space-y-1">
              <div>Critical Violations: <strong className="text-rose-600">{review.analysis?.issueCounts?.critical || 0}</strong></div>
              <div>High Severity: <strong className="text-amber-600">{review.analysis?.issueCounts?.high || 0}</strong></div>
              <div>Medium / Low: <strong className="text-slate-700">{(review.analysis?.issueCounts?.medium || 0) + (review.analysis?.issueCounts?.low || 0)}</strong></div>
            </div>
          </div>

          {/* Submitted Content Review */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Submitted Marketing Copy
            </h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed font-mono whitespace-pre-wrap text-slate-800">
              {review.originalContent}
            </div>
          </div>

          {/* Detected Issues Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Compliance Findings ({issues.length})
            </h4>
            {issues.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No configured guideline violations detected. Copy adheres to registered brand rules.</span>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-[11px] text-left">
                    <tr>
                      <th className="p-2.5 font-semibold">Severity</th>
                      <th className="p-2.5 font-semibold">Evidence Snippet</th>
                      <th className="p-2.5 font-semibold">Rule & Explanation</th>
                      <th className="p-2.5 font-semibold">Correction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {issues.map((iss, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-medium whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              iss.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : iss.severity === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {iss.severity}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-rose-700 max-w-xs break-words">
                          "{iss.exactText}"
                        </td>
                        <td className="p-2.5 text-slate-700 max-w-sm">
                          <div className="font-semibold text-slate-900 mb-0.5">{iss.violatedRule}</div>
                          <div className="text-slate-500 text-[11px]">{iss.explanation}</div>
                        </td>
                        <td className="p-2.5 text-emerald-800 font-medium max-w-xs">
                          {iss.suggestedCorrection}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit Trail */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Governance Audit Trail
            </h4>
            <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-2 bg-slate-50">
              {(review.approvalAudit || []).map((audit, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 border-b border-slate-200/60 pb-1.5 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-slate-900">{audit.reviewer}</span>{' '}
                    <span className="text-slate-500">({audit.reviewerRole})</span>: {audit.rationale}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(audit.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Footer Disclaimers */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <p>
              <strong>Disclaimer:</strong> BrandGuard AI evaluates copy strictly against configured enterprise brand guidelines and stylistic policies. This report does not constitute certified legal, statutory, or financial regulatory compliance advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
