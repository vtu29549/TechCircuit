import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { ApprovalStatus, ReviewRecord } from '../types';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewRecord;
  onUpdateStatus: (
    newStatus: ApprovalStatus,
    reviewer: string,
    reviewerRole: string,
    rationale: string
  ) => Promise<void>;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  review,
  onUpdateStatus,
}) => {
  if (!isOpen) return null;

  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus>(
    review.approvalStatus
  );
  const [reviewerName, setReviewerName] = useState('Pravallika Reddy');
  const [reviewerRole, setReviewerRole] = useState('Brand Governance Lead');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasCritical =
    review.analysis?.hasCriticalBlocker ||
    (review.analysis?.issueCounts?.critical || 0) > 0;

  const statuses: {
    status: ApprovalStatus;
    label: string;
    description: string;
    requiresNoCritical?: boolean;
  }[] = [
    {
      status: 'Draft' as ApprovalStatus,
      label: 'Draft',
      description: 'Work-in-progress content currently being composed or edited.',
    },
    {
      status: 'Needs Revision' as ApprovalStatus,
      label: 'Needs Revision',
      description: 'Violations detected. Sent back to author for adjustments.',
    },
    {
      status: 'Pending Review' as ApprovalStatus,
      label: 'Pending Review',
      description: 'Submitted for formal review by authorized brand lead.',
    },
    {
      status: 'Approved' as ApprovalStatus,
      label: 'Approved for Publication',
      description: 'Fully certified for distribution across official channels.',
      requiresNoCritical: true,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedStatus === 'Approved' && hasCritical) {
      setErrorMsg(
        'Approval blocked: Content has unresolved Critical severity violations. Resolve all critical issues before granting publication approval.'
      );
      return;
    }

    if (!rationale.trim()) {
      setErrorMsg('Please provide a decision rationale explaining this status change.');
      return;
    }

    setLoading(true);
    try {
      await onUpdateStatus(
        selectedStatus,
        reviewerName.trim() || 'Authorized Reviewer',
        reviewerRole.trim() || 'Brand Governance Lead',
        rationale.trim()
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update workflow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Approval Workflow Governance Gate
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Transparency Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Single-User Demo Mode:</span> Multi-user role gates and enterprise SSO authentication are simulated for demonstration. Approval logic strictly enforces real compliance invariants.
          </div>

          {/* Current Review Metadata */}
          <div className="bg-slate-100/70 rounded-lg p-3 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">Campaign:</span>{' '}
              <span className="font-semibold text-slate-800">
                {review.campaignName}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Brand:</span>{' '}
              <span className="font-semibold text-slate-800">
                {review.brandName}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Score:</span>{' '}
              <span className="font-mono font-bold text-slate-800">
                {review.analysis?.score || 0}/100
              </span>
            </div>
            <div>
              <span className="text-slate-500">Current Status:</span>{' '}
              <span className="font-semibold text-teal-700">
                {review.approvalStatus}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Select Target Workflow Status
            </label>
            <div className="space-y-2">
              {statuses.map((item) => {
                const isBlocked = item.requiresNoCritical && hasCritical;
                const isSelected = selectedStatus === item.status;

                return (
                  <div
                    key={item.status}
                    onClick={() => {
                      if (!isBlocked) {
                        setSelectedStatus(item.status);
                        setErrorMsg(null);
                      }
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                        : isBlocked
                        ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-teal-600 bg-teal-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-bold text-slate-900">
                          {item.label}
                        </span>
                      </div>

                      {isBlocked && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertOctagon className="w-3 h-3" />
                          Blocked by Critical Issue
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-1 pl-5 text-[11px]">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviewer Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Reviewer Name
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reviewer Governance Role
              </label>
              <input
                type="text"
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
                required
              />
            </div>
          </div>

          {/* Decision Rationale */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decision Rationale & Governance Comments{' '}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="e.g. Verified compliance with brand voice and disclaimers. Approved for social media syndication."
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
              required
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-800 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <span>Recording Transition...</span>
              ) : (
                <>
                  <span>Commit Status Change</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
