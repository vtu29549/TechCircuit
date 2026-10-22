import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { ContentReview } from './pages/ContentReview';
import { BrandGuidelines } from './pages/BrandGuidelines';
import { ReviewHistory } from './pages/ReviewHistory';
import { Reports } from './pages/Reports';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { api, SystemStatus } from './services/api';
import { BrandProfile, ReviewRecord } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Active review context for opening in review editor
  const [activeReviewForEditor, setActiveReviewForEditor] =
    useState<ReviewRecord | null>(null);
  const [activeBrandIdForEditor, setActiveBrandIdForEditor] = useState<string>('');

  // Privacy notice modal
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Load initial server data
  const loadData = async () => {
    try {
      const [statusData, brandsData, reviewsData] = await Promise.all([
        api.getStatus().catch(() => null),
        api.getBrands().catch(() => []),
        api.getReviews().catch(() => []),
      ]);

      if (statusData) setSystemStatus(statusData);
      setBrands(brandsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching data from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Launch Demo Workflow
  const handleLaunchDemo = () => {
    const novaTech = brands.find((b) => b.name === 'NovaTech') || brands[0];
    setActiveBrandIdForEditor(novaTech?.id || '');
    setActiveReviewForEditor({
      id: `rev-demo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      brandId: novaTech?.id || '',
      brandName: novaTech?.name || 'NovaTech',
      campaignName: 'NovaTech Q4 Social Syndication (Demo)',
      contentType: 'social_media',
      originalContent:
        'Get 100% guaranteed results with our new solution. Sign up today.',
      currentContent:
        'Get 100% guaranteed results with our new solution. Sign up today.',
      analysis: {
        id: `analysis-demo-${Date.now()}`,
        timestamp: new Date().toISOString(),
        brandId: novaTech?.id || '',
        brandName: novaTech?.name || 'NovaTech',
        campaignName: 'NovaTech Q4 Social Syndication (Demo)',
        contentType: 'social_media',
        originalContent:
          'Get 100% guaranteed results with our new solution. Sign up today.',
        score: 45,
        hasCriticalBlocker: true,
        complianceState: 'critical_violations',
        issueCounts: {
          critical: 1,
          high: 1,
          medium: 0,
          low: 0,
          total: 2,
        },
        issues: [
          {
            id: 'demo-iss-1',
            type: 'prohibited_phrase',
            source: 'deterministic',
            severity: 'critical',
            exactText: '100% guaranteed results',
            violatedRule:
              'Prohibited Phrase: Absolute guarantees are disallowed in enterprise cybersecurity.',
            explanation:
              'The phrase "100% guaranteed results" violates NovaTech guidelines prohibiting absolute performance promises.',
            suggestedCorrection:
              'Replace with "demonstrated industry-leading efficacy"',
          },
          {
            id: 'demo-iss-2',
            type: 'missing_disclaimer',
            source: 'deterministic',
            severity: 'high',
            exactText: '[Missing disclaimer]',
            violatedRule:
              'Mandatory Disclaimer: "Terms and conditions apply" must be included for promotional offerings.',
            explanation:
              'The content contains a call-to-action for a new solution without the required terms and conditions disclaimer.',
            suggestedCorrection: 'Append: "Terms and conditions apply."',
          },
        ],
        scoreBreakdown: {
          baseScore: 100,
          criticalDeductions: 35,
          highDeductions: 20,
          mediumDeductions: 0,
          lowDeductions: 0,
          finalScore: 45,
          formula: '100 - (1×35[Critical] + 1×20[High]) = 45',
          scoringNotes:
            'Critical Violation Blocker: Content contains 1 critical violation(s). Publication approval is hard-blocked.',
        },
        aiAnalysisStatus: 'completed',
        aiAnalysisNotes:
          'Contextual tone is salesy and lacks empirical validation expected for NovaTech.',
        deterministicMatchCount: 2,
        aiMatchCount: 1,
      },
      approvalStatus: 'Needs Revision',
      approvalAudit: [
        {
          timestamp: new Date().toISOString(),
          fromStatus: 'Draft',
          toStatus: 'Needs Revision',
          reviewer: 'Automated Governance Gate',
          reviewerRole: 'Compliance Scanner',
          rationale:
            'Flagged for revision due to 1 critical prohibited phrase and 1 missing disclaimer.',
        },
      ],
    });
    setCurrentTab('new-review');
  };

  // Reset Demo
  const handleResetDemo = async () => {
    if (
      confirm(
        'Restore demo data to pristine state? This will reset all reviews and brands.'
      )
    ) {
      try {
        await api.resetDemoData();
        await loadData();
        setActiveReviewForEditor(null);
        setCurrentTab('dashboard');
      } catch (err) {
        console.error('Reset failed:', err);
      }
    }
  };

  // Save / Update Brand
  const handleSaveBrand = async (brandData: Partial<BrandProfile>) => {
    const saved = await api.saveBrand(brandData);
    setBrands((prev) => {
      const idx = prev.findIndex((b) => b.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  // Delete Brand
  const handleDeleteBrand = async (id: string) => {
    await api.deleteBrand(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  // Save Review Record
  const handleSaveReviewRecord = async (record: ReviewRecord) => {
    try {
      const saved = await api.saveReview(record);
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r.id === saved.id);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
    } catch (err) {
      console.error('Failed to persist review record:', err);
    }
  };

  // Delete Review Record
  const handleDeleteReview = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      if (activeReviewForEditor?.id === id) {
        setActiveReviewForEditor(null);
      }
    } catch (err) {
      console.error('Failed to delete review record:', err);
    }
  };

  // Export all reviews as CSV
  const handleExportAllCsv = () => {
    const headers = [
      'Review ID',
      'Campaign Name',
      'Brand Name',
      'Content Type',
      'Compliance Score',
      'Approval Status',
      'Critical Issues',
      'High Issues',
      'Medium Issues',
      'Low Issues',
      'Total Issues',
      'Created Date',
      'Original Content',
    ];

    const rows = reviews.map((r) => [
      r.id,
      `"${r.campaignName.replace(/"/g, '""')}"`,
      `"${r.brandName.replace(/"/g, '""')}"`,
      r.contentType,
      String(r.analysis?.score || 0),
      r.approvalStatus,
      String(r.analysis?.issueCounts?.critical || 0),
      String(r.analysis?.issueCounts?.high || 0),
      String(r.analysis?.issueCounts?.medium || 0),
      String(r.analysis?.issueCounts?.low || 0),
      String(r.analysis?.issueCounts?.total || 0),
      r.createdAt,
      `"${r.originalContent.replace(/"/g, '""')}"`,
    ]);

    const csv =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'BrandGuard_AI_All_Reviews_Audit.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300 gap-3">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <div className="font-semibold text-sm">Initializing BrandGuard AI...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'new-review') {
            setActiveReviewForEditor(null);
          }
          setCurrentTab(tab);
        }}
        onLaunchDemo={handleLaunchDemo}
        onResetDemo={handleResetDemo}
        geminiConnected={!!systemStatus?.geminiConfigured}
        onOpenPrivacyNotice={() => setShowPrivacyModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onLaunchDemo={handleLaunchDemo}
          onNewReviewClick={() => {
            setActiveReviewForEditor(null);
            setCurrentTab('new-review');
          }}
          brandCount={brands.length}
          reviewCount={reviews.length}
        />

        {/* Page Views Viewport */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              brands={brands}
              reviews={reviews}
              onNavigate={(tab) => {
                if (tab === 'new-review') {
                  setActiveReviewForEditor(null);
                }
                setCurrentTab(tab);
              }}
              onLaunchDemo={handleLaunchDemo}
              onSelectReview={(rev) => {
                setActiveReviewForEditor(rev);
                setCurrentTab('new-review');
              }}
            />
          )}

          {currentTab === 'new-review' && (
            <ContentReview
              brands={brands}
              initialBrandId={activeBrandIdForEditor}
              initialReview={activeReviewForEditor}
              onSaveReviewRecord={handleSaveReviewRecord}
              onNavigateToHistory={() => setCurrentTab('history')}
            />
          )}

          {currentTab === 'guidelines' && (
            <BrandGuidelines
              brands={brands}
              onSaveBrand={handleSaveBrand}
              onDeleteBrand={handleDeleteBrand}
              onSelectBrandForReview={(brandId) => {
                setActiveBrandIdForEditor(brandId);
                setActiveReviewForEditor(null);
                setCurrentTab('new-review');
              }}
            />
          )}

          {currentTab === 'history' && (
            <ReviewHistory
              reviews={reviews}
              onSelectReview={(rev) => {
                setActiveReviewForEditor(rev);
                setCurrentTab('new-review');
              }}
              onDeleteReview={handleDeleteReview}
              onExportAllCsv={handleExportAllCsv}
            />
          )}

          {currentTab === 'reports' && (
            <Reports reviews={reviews} onExportAllCsv={handleExportAllCsv} />
          )}
        </main>
      </div>

      {/* Privacy, Regulatory & AI Handling Modal */}
      <PrivacyNoticeModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
