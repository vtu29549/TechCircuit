import React, { useState } from 'react';
import {
  Sparkles,
  FileCheck2,
  RefreshCw,
  Copy,
  Download,
  Check,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  Send,
  FileText,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import {
  BrandProfile,
  ComplianceAnalysisResult,
  ContentType,
  ContentRewriteResult,
  ReviewRecord,
  Severity,
  IssueCategory,
} from '../types';
import { api } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { IssueCard } from '../components/IssueCard';
import { WorkflowModal } from '../components/WorkflowModal';
import { ReportModal } from '../components/ReportModal';

interface ContentReviewProps {
  brands: BrandProfile[];
  initialBrandId?: string;
  initialReview?: ReviewRecord | null;
  onSaveReviewRecord: (review: ReviewRecord) => void;
  onNavigateToHistory: () => void;
}

export const ContentReview: React.FC<ContentReviewProps> = ({
  brands,
  initialBrandId,
  initialReview,
  onSaveReviewRecord,
  onNavigateToHistory,
}) => {
  // Form State
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    initialReview?.brandId || initialBrandId || brands[0]?.id || ''
  );
  const [campaignName, setCampaignName] = useState<string>(
    initialReview?.campaignName || 'Q4 Enterprise Cloud Product Launch'
  );
  const [contentType, setContentType] = useState<ContentType>(
    initialReview?.contentType || 'social_media'
  );
  const [content, setContent] = useState<string>(
    initialReview?.originalContent || ''
  );

  // Analysis & Rewrite State
  const [analyzing, setAnalyzing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [analysis, setAnalysis] = useState<ComplianceAnalysisResult | null>(
    initialReview?.analysis || null
  );
  const [rewriteResult, setRewriteResult] = useState<ContentRewriteResult | null>(
    initialReview?.rewrittenDraft || null
  );
  const [editedRevisedContent, setEditedRevisedContent] = useState<string>(
    initialReview?.rewrittenDraft?.rewrittenContent || ''
  );
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtering for issues
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Modals & Workflow
  const [currentReviewRecord, setCurrentReviewRecord] = useState<ReviewRecord | null>(
    initialReview || null
  );
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const activeBrand =
    brands.find((b) => b.id === selectedBrandId) || brands[0] || null;

  // Quick Loader for the exact Sample Demo from requirements
  const handleLoadSampleDemo = () => {
    // NovaTech demo sample
    const novaBrand = brands.find((b) => b.name === 'NovaTech') || brands[0];
    if (novaBrand) {
      setSelectedBrandId(novaBrand.id);
    }
    setCampaignName('NovaTech Q4 Social Syndication');
    setContentType('social_media');
    setContent('Get 100% guaranteed results with our new solution. Sign up today.');
    setAnalysis(null);
    setRewriteResult(null);
    setEditedRevisedContent('');
    setErrorMsg(null);
  };

  // Run Compliance Analysis (Deterministic + Gemini Contextual)
  const handleAnalyze = async (overrideContent?: string) => {
    const textToAnalyze = overrideContent !== undefined ? overrideContent : content;
    if (!textToAnalyze.trim()) {
      setErrorMsg('Please enter marketing copy to analyze.');
      return;
    }
    if (!selectedBrandId) {
      setErrorMsg('Please select an active brand profile.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const result = await api.analyzeContent({
        content: textToAnalyze,
        brandId: selectedBrandId,
        campaignName: campaignName || 'Untitled Campaign',
        contentType,
      });

      setAnalysis(result);

      // Create / update working review record
      const updatedRecord: ReviewRecord = {
        id: currentReviewRecord?.id || `rev-${Date.now()}`,
        createdAt: currentReviewRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        brandId: selectedBrandId,
        brandName: activeBrand?.name || 'Selected Brand',
        campaignName: campaignName || 'Untitled Campaign',
        contentType,
        originalContent: textToAnalyze,
        currentContent: textToAnalyze,
        analysis: result,
        rewrittenDraft: rewriteResult || undefined,
        approvalStatus: result.hasCriticalBlocker ? 'Needs Revision' : 'Draft',
        approvalAudit: currentReviewRecord?.approvalAudit || [
          {
            timestamp: new Date().toISOString(),
            fromStatus: 'Draft',
            toStatus: result.hasCriticalBlocker ? 'Needs Revision' : 'Draft',
            reviewer: 'Automated Governance Engine',
            reviewerRole: 'Compliance Scanner',
            rationale: result.hasCriticalBlocker
              ? 'Flagged for revision due to unresolved critical severity issues.'
              : 'Initial scan completed.',
          },
        ],
      };

      setCurrentReviewRecord(updatedRecord);
      onSaveReviewRecord(updatedRecord);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMsg(err.message || 'Compliance analysis encountered an error');
    } finally {
      setAnalyzing(false);
    }
  };

  // AI Content Rewriter
  const handleRewrite = async () => {
    if (!content.trim() || !activeBrand) return;

    setRewriting(true);
    setErrorMsg(null);

    try {
      const result = await api.rewriteContent({
        content,
        brandId: activeBrand.id,
        contentType,
        issues: analysis?.issues || [],
      });

      setRewriteResult(result);
      setEditedRevisedContent(result.rewrittenContent);

      if (currentReviewRecord) {
        const updated = {
          ...currentReviewRecord,
          rewrittenDraft: result,
          updatedAt: new Date().toISOString(),
        };
        setCurrentReviewRecord(updated);
        onSaveReviewRecord(updated);
      }
    } catch (err: any) {
      console.error('Rewrite failed:', err);
      setErrorMsg(err.message || 'Rewriting failed');
    } finally {
      setRewriting(false);
    }
  };

  // Recheck Revised Content
  const handleRecheckRevised = async () => {
    if (!editedRevisedContent.trim()) return;
    setContent(editedRevisedContent);
    await handleAnalyze(editedRevisedContent);
  };

  // Apply single correction to current content
  const handleApplySingleCorrection = (correction: string, originalSnippet: string) => {
    if (content.includes(originalSnippet)) {
      // Clean replace
      const cleanCorrection = correction.replace(/^Replace ".*" with "/, '').replace(/"$/, '');
      const updated = content.replace(originalSnippet, cleanCorrection);
      setContent(updated);
    } else if (correction.includes('Append disclaimer:')) {
      const disclaimerMatch = correction.match(/"([^"]+)"/);
      const textToAppend = disclaimerMatch ? disclaimerMatch[1] : '';
      if (textToAppend && !content.includes(textToAppend)) {
        setContent((prev) => `${prev.trim()} ${textToAppend}.`);
      }
    }
  };

  // Copy Revised Draft
  const handleCopyRevised = () => {
    navigator.clipboard.writeText(editedRevisedContent);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // Download Revised Draft as .txt file
  const handleDownloadRevised = () => {
    const blob = new Blob([editedRevisedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${campaignName.replace(/\s+/g, '_')}_compliant_draft.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter issues
  const filteredIssues = (analysis?.issues || []).filter((issue) => {
    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && issue.type !== categoryFilter) return false;
    if (sourceFilter !== 'all' && issue.source !== sourceFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Context */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Content Review & Brand Compliance Engine
            </h2>
            <span className="text-[11px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              Deterministic + Gemini Contextual
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate marketing copy against brand guidelines, prohibited phrases, and required disclaimers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSampleDemo}
            className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Load Sample with Violations</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Brand Profile Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Brand Profile & Guideline Set
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:outline-teal-500"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.name === 'NovaTech' ? '(Official Demo)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Q4 Cloud Security Campaign"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:outline-teal-500"
            >
              <option value="social_media">Social Media Post</option>
              <option value="advertisement">Advertisement / Digital Ad</option>
              <option value="marketing_email">Marketing Email</option>
              <option value="blog_article">Blog Article / Longform</option>
            </select>
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <label className="font-semibold text-slate-700">
              Marketing Copy Draft
            </label>
            <div className="text-slate-400 font-mono text-[11px] space-x-2">
              <span>{content.length} characters</span>
              <span>·</span>
              <span>
                {content.trim() ? content.trim().split(/\s+/).length : 0} words
              </span>
            </div>
          </div>

          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your marketing draft here... (e.g. 'Get 100% guaranteed results with our new solution. Sign up today.')"
            className="w-full p-3.5 border border-slate-300 rounded-lg focus:outline-teal-500 text-xs text-slate-900 leading-relaxed font-sans placeholder:text-slate-400"
          />
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-500">
            {activeBrand ? (
              <span>
                Active Guideline:{' '}
                <strong className="text-slate-800">{activeBrand.name}</strong> (
                {activeBrand.prohibitedPhrases?.length || 0} prohibited phrases,{' '}
                {activeBrand.requiredDisclaimers?.length || 0} disclaimers)
              </span>
            ) : null}
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={analyzing}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Compliance Checks...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4 text-teal-400" />
                <span>Analyze Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6">
          {/* Score Gauge & Deductions */}
          <ScoreGauge
            score={analysis.score}
            hasCriticalBlocker={analysis.hasCriticalBlocker}
            issueCounts={analysis.issueCounts}
            scoreBreakdown={analysis.scoreBreakdown}
            brandName={activeBrand?.name || 'Selected Brand'}
          />

          {/* Workflow Status Bar & Actions */}
          {currentReviewRecord && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-slate-700">Governance Workflow Status:</span>
                <span
                  className={`px-2.5 py-1 rounded font-bold ${
                    currentReviewRecord.approvalStatus === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentReviewRecord.approvalStatus === 'Needs Revision'
                      ? 'bg-amber-100 text-amber-800'
                      : currentReviewRecord.approvalStatus === 'Pending Review'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {currentReviewRecord.approvalStatus}
                </span>
                {analysis.hasCriticalBlocker && (
                  <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Approval hard-blocked until critical issues are resolved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWorkflowModal(true)}
                  className="px-3.5 py-1.5 font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-slate-600" />
                  <span>Update Approval Status</span>
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3.5 py-1.5 font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>View Report / Export</span>
                </button>
              </div>
            </div>
          )}

          {/* Issues Section with Category & Severity Filters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Detected Compliance Findings ({analysis.issues.length})
                </h3>
                <p className="text-xs text-slate-500">
                  {analysis.deterministicMatchCount} deterministic rule matches ·{' '}
                  {analysis.aiMatchCount} contextual AI assessments
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Source Filter */}
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-slate-700"
                >
                  <option value="all">All Sources</option>
                  <option value="deterministic">Deterministic Only</option>
                  <option value="ai_contextual">Contextual AI Only</option>
                </select>
              </div>
            </div>

            {/* AI Offline Disclaimer if applicable */}
            {analysis.aiAnalysisStatus === 'unavailable' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <strong>Contextual AI Notice:</strong> {analysis.aiAnalysisNotes}
              </div>
            )}

            {/* Issue Cards Grid */}
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                {analysis.issues.length === 0 ? (
                  <div className="space-y-1">
                    <Check className="w-6 h-6 text-emerald-600 mx-auto" />
                    <div className="font-bold text-slate-800 text-sm">
                      No Configured Rule Violations Detected
                    </div>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Submitted draft satisfies all registered prohibited phrase rules, required disclaimers, and approved terminology. Note: This automated check does not certify statutory legal compliance.
                    </p>
                  </div>
                ) : (
                  <span>No issues match the selected filter criteria.</span>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onApplyCorrection={handleApplySingleCorrection}
                  />
                ))}
              </div>
            )}
          </div>

          {/* AI Content Rewriter & Side-by-Side Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    AI Content Rewriter & Guidelines Harmonizer
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Generate revised, compliant draft that preserves core intent while eliminating violations.
                </p>
              </div>

              <button
                onClick={handleRewrite}
                disabled={rewriting}
                className="px-4 py-2 text-xs font-bold text-teal-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                {rewriting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Revision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-teal-950" />
                    <span>Rewrite Content</span>
                  </>
                )}
              </button>
            </div>

            {/* Side-by-Side Comparison Area */}
            {rewriteResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Original Draft */}
                  <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Original Draft (Contains Violations)</span>
                      <span className="font-mono text-rose-600 text-[11px]">
                        Score: {analysis.score}/100
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap p-2.5 bg-white rounded border border-slate-200 min-h-[120px]">
                      {content}
                    </div>
                  </div>

                  {/* Right: Revised Compliant Draft (Editable) */}
                  <div className="border border-teal-200 rounded-lg p-3.5 bg-teal-50/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-teal-950">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                        <span>Revised Compliant Version (Editable)</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                        {rewriteResult.engineUsed === 'gemini'
                          ? 'Gemini 3.8 Flash'
                          : 'Rule Engine Fallback'}
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={editedRevisedContent}
                      onChange={(e) => setEditedRevisedContent(e.target.value)}
                      className="w-full text-xs text-slate-900 leading-relaxed p-2.5 bg-white rounded border border-teal-300 focus:outline-teal-500 min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Changes Explanation */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-900">
                    Compliance Adjustments Summary:
                  </div>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                    {rewriteResult.changesMade.map((ch, idx) => (
                      <li key={idx}>{ch}</li>
                    ))}
                  </ul>
                  <div className="text-slate-500 text-[11px] pt-1">
                    <strong>Rationale:</strong> {rewriteResult.rationale}
                  </div>
                </div>

                {/* Action Bar for Revised Draft */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyRevised}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {copiedDraft ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Revised Text</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadRevised}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download .txt</span>
                    </button>
                  </div>

                  {/* Recheck Content Button */}
                  <button
                    onClick={handleRecheckRevised}
                    disabled={analyzing}
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recheck Content Against Brand Rules</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Click <strong>"Rewrite Content"</strong> above to generate an executive revised draft conforming to "{activeBrand?.name}" voice and disclaimers.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow Transition Modal */}
      {currentReviewRecord && showWorkflowModal && (
        <WorkflowModal
          isOpen={showWorkflowModal}
          onClose={() => setShowWorkflowModal(false)}
          review={currentReviewRecord}
          onUpdateStatus={async (newStatus, reviewer, reviewerRole, rationale) => {
            const updated = await api.updateReviewStatus(
              currentReviewRecord.id,
              {
                newStatus,
                reviewer,
                reviewerRole,
                rationale,
              }
            );
            setCurrentReviewRecord(updated);
            onSaveReviewRecord(updated);
          }}
        />
      )}

      {/* Executive Report Modal */}
      {currentReviewRecord && showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          review={currentReviewRecord}
        />
      )}
    </div>
  );
};
