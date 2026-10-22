export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type IssueCategory =
  | 'prohibited_phrase'
  | 'missing_disclaimer'
  | 'brand_voice'
  | 'unsupported_claim'
  | 'inconsistent_terminology'
  | 'claim_restriction';

export type IssueSource = 'deterministic' | 'ai_contextual';

export type ContentType =
  | 'social_media'
  | 'advertisement'
  | 'marketing_email'
  | 'blog_article';

export type ApprovalStatus =
  | 'Draft'
  | 'Needs Revision'
  | 'Pending Review'
  | 'Approved';

export interface ApprovedTerm {
  id: string;
  term: string;
  preferredOver?: string;
  context?: string;
}

export interface ProhibitedPhrase {
  id: string;
  phrase: string;
  reason: string;
  severity: Severity;
  suggestedAlternative?: string;
}

export interface RequiredDisclaimer {
  id: string;
  text: string;
  placement: 'footnote' | 'end' | 'inline';
  mandatoryForContentTypes?: ContentType[];
  triggerKeywords?: string[];
}

export interface ClaimRestriction {
  id: string;
  claimPattern: string;
  guidance: string;
  severity: Severity;
}

export interface BrandProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  targetAudience: string;
  brandVoice: string;
  toneAttributes: string[];
  approvedTerms: ApprovedTerm[];
  prohibitedPhrases: ProhibitedPhrase[];
  requiredDisclaimers: RequiredDisclaimer[];
  claimRestrictions: ClaimRestriction[];
  severityWeights: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceIssue {
  id: string;
  type: IssueCategory;
  source: IssueSource;
  severity: Severity;
  exactText: string;
  violatedRule: string;
  explanation: string;
  suggestedCorrection: string;
  location?: {
    start?: number;
    end?: number;
  };
}

export interface ScoreBreakdown {
  baseScore: number;
  criticalDeductions: number;
  highDeductions: number;
  mediumDeductions: number;
  lowDeductions: number;
  finalScore: number;
  formula: string;
  scoringNotes: string;
}

export interface ComplianceAnalysisResult {
  id: string;
  timestamp: string;
  brandId: string;
  brandName: string;
  campaignName: string;
  contentType: ContentType;
  originalContent: string;
  score: number;
  hasCriticalBlocker: boolean;
  complianceState: 'compliant' | 'needs_attention' | 'critical_violations';
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  issues: ComplianceIssue[];
  scoreBreakdown: ScoreBreakdown;
  aiAnalysisStatus: 'completed' | 'unavailable' | 'skipped';
  aiAnalysisNotes?: string;
  deterministicMatchCount: number;
  aiMatchCount: number;
}

export interface ContentRewriteResult {
  rewrittenContent: string;
  changesMade: string[];
  rationale: string;
  preservedMeaningCheck: boolean;
  engineUsed: 'gemini' | 'rule_based_fallback';
}

export interface ApprovalAuditEntry {
  timestamp: string;
  fromStatus: ApprovalStatus;
  toStatus: ApprovalStatus;
  reviewer: string;
  reviewerRole: string;
  rationale: string;
}

export interface ReviewRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  brandId: string;
  brandName: string;
  campaignName: string;
  contentType: ContentType;
  originalContent: string;
  currentContent: string;
  analysis: ComplianceAnalysisResult;
  rewrittenDraft?: ContentRewriteResult;
  approvalStatus: ApprovalStatus;
  approvalAudit: ApprovalAuditEntry[];
  reviewerNotes?: string;
}
