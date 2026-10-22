import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Download,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { ReviewRecord, ApprovalStatus } from '../types';

interface ReviewHistoryProps {
  reviews: ReviewRecord[];
  onSelectReview: (review: ReviewRecord) => void;
  onDeleteReview: (id: string) => Promise<void>;
  onExportAllCsv: () => void;
}

export const ReviewHistory: React.FC<ReviewHistoryProps> = ({
  reviews,
  onSelectReview,
  onDeleteReview,
  onExportAllCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Extract unique brands from reviews
  const uniqueBrands = Array.from(new Set(reviews.map((r) => r.brandName)));

  const filteredReviews = reviews.filter((r) => {
    // Search query
    if (
      searchQuery &&
      !r.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.brandName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.originalContent.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Brand filter
    if (selectedBrand !== 'all' && r.brandName !== selectedBrand) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && r.approvalStatus !== selectedStatus) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Audit & Compliance Review History
            </h2>
            <p className="text-xs text-slate-500">
              Permanent server-side audit logs of marketing reviews and governance sign-offs
            </p>
          </div>
        </div>

        <button
          onClick={onExportAllCsv}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export All Reviews (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, brands, or copy..."
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 text-xs"
          />
        </div>

        {/* Brand Filter */}
        <div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-teal-500 font-medium"
          >
            <option value="all">All Brands ({reviews.length})</option>
            {uniqueBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-teal-500 font-medium"
          >
            <option value="all">All Workflow Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Needs Revision">Needs Revision</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Persistence Transparency Note */}
      <div className="text-[11px] text-slate-500 px-1 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>
          Records are stored in the server's persistent disk database (<code className="font-mono text-slate-700">data/db.json</code>) and preserved across browser page reloads.
        </span>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No reviews match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Campaign</th>
                  <th className="py-3 px-4 font-semibold">Brand</th>
                  <th className="py-3 px-4 font-semibold">Content Type</th>
                  <th className="py-3 px-4 font-semibold text-center">Score</th>
                  <th className="py-3 px-4 font-semibold">Workflow Status</th>
                  <th className="py-3 px-4 font-semibold">Audit Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => {
                  const score = rev.analysis?.score || 0;
                  const hasCrit =
                    rev.analysis?.hasCriticalBlocker ||
                    (rev.analysis?.issueCounts?.critical || 0) > 0;

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {rev.campaignName}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px] truncate max-w-xs">
                          {rev.id}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {rev.brandName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {rev.contentType.replace('_', ' ')}
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
                        {new Date(rev.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectReview(rev)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3 text-teal-600" />
                            <span>Reopen</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete review "${rev.campaignName}"?`)) {
                                onDeleteReview(rev.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
