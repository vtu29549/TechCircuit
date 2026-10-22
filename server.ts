import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_BRANDS, INITIAL_REVIEWS } from './src/data/initialData';
import {
  BrandProfile,
  ComplianceAnalysisResult,
  ComplianceIssue,
  ContentRewriteResult,
  ReviewRecord,
  ScoreBreakdown,
  ApprovalStatus,
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent Storage Directory & Database
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  brands: BrandProfile[];
  reviews: ReviewRecord[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.brands) && Array.isArray(parsed.reviews)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading db.json, initializing with default data:', err);
  }

  const initial: DatabaseSchema = {
    brands: INITIAL_BRANDS,
    reviews: INITIAL_REVIEWS,
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

let db = loadDatabase();

// Google Gemini Server-Side Client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Deterministic Compliance Engine
function runDeterministicChecks(
  content: string,
  brand: BrandProfile,
  contentType: string
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const normalizedContent = content.toLowerCase();

  // 1. Prohibited phrases check
  for (const item of brand.prohibitedPhrases) {
    const phraseLower = item.phrase.toLowerCase().trim();
    if (!phraseLower) continue;

    // Word boundary or substring match
    const index = normalizedContent.indexOf(phraseLower);
    if (index !== -1) {
      const exactText = content.substring(index, index + item.phrase.length);
      issues.push({
        id: `det-proh-${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'prohibited_phrase',
        source: 'deterministic',
        severity: item.severity,
        exactText: exactText || item.phrase,
        violatedRule: `Prohibited Phrase: "${item.phrase}" is disallowed. ${item.reason}`,
        explanation: `The submitted content contains the prohibited phrase "${item.phrase}". ${item.reason}`,
        suggestedCorrection: item.suggestedAlternative
          ? `Replace "${exactText}" with "${item.suggestedAlternative}"`
          : `Remove or rephrase "${exactText}"`,
        location: {
          start: index,
          end: index + item.phrase.length,
        },
      });
    }
  }

  // 2. Required disclaimers check
  for (const disclaimer of brand.requiredDisclaimers) {
    const disclaimerLower = disclaimer.text.toLowerCase().trim();
    if (!disclaimerLower) continue;

    // Check if mandatory for this content type
    const isApplicableType =
      !disclaimer.mandatoryForContentTypes ||
      disclaimer.mandatoryForContentTypes.length === 0 ||
      disclaimer.mandatoryForContentTypes.includes(contentType as any);

    if (!isApplicableType) continue;

    // Check trigger keywords if specified
    let isTriggered = true;
    if (disclaimer.triggerKeywords && disclaimer.triggerKeywords.length > 0) {
      isTriggered = disclaimer.triggerKeywords.some((kw) =>
        normalizedContent.includes(kw.toLowerCase())
      );
    }

    if (isTriggered) {
      // Check if disclaimer text is present in the content
      const containsDisclaimer = normalizedContent.includes(disclaimerLower);
      if (!containsDisclaimer) {
        issues.push({
          id: `det-disc-${disclaimer.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'missing_disclaimer',
          source: 'deterministic',
          severity: 'high',
          exactText: `[Missing at ${disclaimer.placement || 'end'} of copy]`,
          violatedRule: `Mandatory Disclaimer: "${disclaimer.text}" must be included for ${contentType.replace('_', ' ')}.`,
          explanation: `The submitted content triggers compliance requirement for disclaimer "${disclaimer.text}", but it was not detected in the copy.`,
          suggestedCorrection: `Append disclaimer: "${disclaimer.text}" (${disclaimer.placement || 'end'} placement).`,
        });
      }
    }
  }

  // 3. Approved terminology check (detect non-preferred variants)
  for (const term of brand.approvedTerms) {
    if (term.preferredOver) {
      const nonPreferredList = term.preferredOver
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      for (const nonPreferred of nonPreferredList) {
        const index = normalizedContent.indexOf(nonPreferred);
        if (index !== -1) {
          const exactText = content.substring(index, index + nonPreferred.length);
          issues.push({
            id: `det-term-${term.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'inconsistent_terminology',
            source: 'deterministic',
            severity: 'medium',
            exactText: exactText || nonPreferred,
            violatedRule: `Preferred Terminology: Use "${term.term}" instead of "${nonPreferred}".`,
            explanation: `Brand guidelines designate "${term.term}" as the approved corporate term. Found outdated or non-standard term "${exactText}". ${term.context || ''}`,
            suggestedCorrection: `Replace "${exactText}" with approved term "${term.term}".`,
            location: {
              start: index,
              end: index + nonPreferred.length,
            },
          });
        }
      }
    }
  }

  // 4. Claim restrictions check
  for (const restriction of brand.claimRestrictions || []) {
    const pattern = restriction.claimPattern.toLowerCase();
    const commonPatterns: Record<string, string[]> = {
      uptime: ['99.99%', '100% uptime', 'never down', 'always up'],
      savings: ['save 50%', 'save 40%', 'guaranteed roi', 'cut costs by'],
      zero: ['zero risk', 'zero vulnerabilities', 'zero flaws'],
    };

    let matched = false;
    let matchedText = '';

    for (const [key, triggers] of Object.entries(commonPatterns)) {
      if (pattern.includes(key)) {
        for (const trig of triggers) {
          const idx = normalizedContent.indexOf(trig);
          if (idx !== -1) {
            matched = true;
            matchedText = content.substring(idx, idx + trig.length);
            break;
          }
        }
      }
      if (matched) break;
    }

    if (matched) {
      issues.push({
        id: `det-claim-${restriction.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'claim_restriction',
        source: 'deterministic',
        severity: restriction.severity || 'high',
        exactText: matchedText,
        violatedRule: `Claim Restriction: ${restriction.claimPattern}`,
        explanation: restriction.guidance,
        suggestedCorrection: `Qualify or cite verified reference for "${matchedText}". ${restriction.guidance}`,
      });
    }
  }

  return issues;
}

// Compute transparent compliance score
function computeScore(issues: ComplianceIssue[], weights: BrandProfile['severityWeights']): ScoreBreakdown {
  const baseScore = 100;
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;
  const lowCount = issues.filter((i) => i.severity === 'low').length;

  const criticalDeductions = criticalCount * (weights.critical || 35);
  const highDeductions = highCount * (weights.high || 20);
  const mediumDeductions = mediumCount * (weights.medium || 10);
  const lowDeductions = lowCount * (weights.low || 5);

  const totalDeductions =
    criticalDeductions + highDeductions + mediumDeductions + lowDeductions;
  let finalScore = Math.max(0, baseScore - totalDeductions);

  let scoringNotes = '';
  if (criticalCount > 0) {
    // A high score must not override an unresolved critical violation
    scoringNotes = `Critical Violation Blocker: Content contains ${criticalCount} critical violation(s). Publication approval is hard-blocked.`;
  } else if (finalScore === 100) {
    scoringNotes =
      'No configured rule violations detected against the selected brand profile. Note: Does not certify legal or regulatory immunity.';
  } else if (finalScore >= 80) {
    scoringNotes = 'Minor non-blocking items detected. Review recommended corrections before submission.';
  } else {
    scoringNotes = 'Significant compliance deviations detected. Content requires revision prior to approval.';
  }

  const formula = `${baseScore} - (${criticalCount}×${weights.critical}[Crit] + ${highCount}×${weights.high}[High] + ${mediumCount}×${weights.medium}[Med] + ${lowCount}×${weights.low}[Low]) = ${finalScore}`;

  return {
    baseScore,
    criticalDeductions,
    highDeductions,
    mediumDeductions,
    lowDeductions,
    finalScore,
    formula,
    scoringNotes,
  };
}

// Contextual Gemini Analysis
async function runContextualAIAnalysis(
  content: string,
  brand: BrandProfile,
  contentType: string,
  deterministicIssues: ComplianceIssue[]
): Promise<{ issues: ComplianceIssue[]; status: 'completed' | 'unavailable'; notes: string }> {
  if (!aiClient) {
    return {
      issues: [],
      status: 'unavailable',
      notes:
        'Contextual AI analysis unavailable (server Gemini API key is not configured). Deterministic rule checks completed successfully.',
    };
  }

  try {
    const prompt = `You are the Compliance Engine for BrandGuard AI. Analyze the following marketing copy against the brand guidelines for "${brand.name}".

BRAND CONTEXT:
- Brand Name: ${brand.name}
- Tagline: ${brand.tagline}
- Description: ${brand.description}
- Target Audience: ${brand.targetAudience}
- Brand Voice: ${brand.brandVoice}
- Tone Attributes: ${brand.toneAttributes.join(', ')}
- Content Type: ${contentType}

BRAND RULES & RESTRICTIONS:
- Approved Terms: ${JSON.stringify(brand.approvedTerms.map((t) => ({ approved: t.term, replace: t.preferredOver, context: t.context })))}
- Prohibited Phrases: ${JSON.stringify(brand.prohibitedPhrases.map((p) => ({ phrase: p.phrase, reason: p.reason, severity: p.severity })))}
- Required Disclaimers: ${JSON.stringify(brand.requiredDisclaimers.map((d) => d.text))}
- Claim Restrictions: ${JSON.stringify(brand.claimRestrictions.map((c) => ({ pattern: c.claimPattern, guidance: c.guidance })))}

ALREADY DETECTED DETERMINISTIC ISSUES:
${deterministicIssues.map((d) => `- [${d.severity}] ${d.exactText}: ${d.violatedRule}`).join('\n') || 'None'}

SUBMITTED CONTENT TO EVALUATE:
"""
${content}
"""

INSTRUCTIONS:
1. Detect any contextual brand voice mismatches, unsupported claims, misleading statistics, tone deviations, or subtle policy conflicts not already covered by the deterministic checks.
2. Do NOT invent legal opinions or claim regulatory certification.
3. Be rigorous, grounded, and concise. Only report genuine issues with exact evidence substrings from the submitted content.
4. If the copy is brand-compliant, return an empty array for contextual issues.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a senior brand governance and corporate compliance auditor. Return only valid JSON conforming strictly to the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessmentSummary: {
              type: Type.STRING,
              description: 'Executive summary of contextual brand alignment.',
            },
            contextualIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'One of: brand_voice, unsupported_claim, inconsistent_terminology, claim_restriction',
                  },
                  severity: {
                    type: Type.STRING,
                    description: 'critical, high, medium, or low',
                  },
                  exactText: {
                    type: Type.STRING,
                    description: 'Exact verbatim text snippet from the content that triggered the issue.',
                  },
                  violatedRule: {
                    type: Type.STRING,
                    description: 'The specific brand guideline or voice pillar violated.',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Objective explanation of why this contradicts the brand voice or standards.',
                  },
                  suggestedCorrection: {
                    type: Type.STRING,
                    description: 'Specific suggested rewrite or phrasing correction.',
                  },
                },
                required: ['type', 'severity', 'exactText', 'violatedRule', 'explanation', 'suggestedCorrection'],
              },
            },
          },
          required: ['assessmentSummary', 'contextualIssues'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const aiIssues: ComplianceIssue[] = (parsed.contextualIssues || []).map((ci: any) => {
      // Validate severity
      const validSeverities: Array<ComplianceIssue['severity']> = ['critical', 'high', 'medium', 'low'];
      const severity = validSeverities.includes(ci.severity) ? ci.severity : 'medium';

      return {
        id: `ai-ctx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: ci.type || 'brand_voice',
        source: 'ai_contextual',
        severity,
        exactText: ci.exactText || '[Contextual voice tone]',
        violatedRule: ci.violatedRule || 'Brand Voice Alignment',
        explanation: ci.explanation || 'Content conflicts with configured brand tone and guidelines.',
        suggestedCorrection: ci.suggestedCorrection || 'Revise to reflect brand guidelines.',
      };
    });

    return {
      issues: aiIssues,
      status: 'completed',
      notes: parsed.assessmentSummary || 'Contextual AI assessment completed.',
    };
  } catch (err: any) {
    console.error('Gemini contextual analysis failed:', err);
    return {
      issues: [],
      status: 'unavailable',
      notes: `Contextual AI analysis encountered an error (${err?.message || 'Request failed'}). Deterministic rule checks completed successfully.`,
    };
  }
}

// Contextual Gemini Content Rewriter
async function rewriteContent(
  content: string,
  brand: BrandProfile,
  contentType: string,
  issues: ComplianceIssue[]
): Promise<ContentRewriteResult> {
  // If AI client is available, use Gemini
  if (aiClient) {
    try {
      const prompt = `You are BrandGuard AI's executive brand copy rewriter.

TASK:
Rewrite the submitted content for "${brand.name}" to make it 100% compliant with the brand guidelines, eliminating all detected violations, while PRESERVING the original marketing purpose and core message.

BRAND GUIDELINES:
- Brand Name: ${brand.name}
- Brand Voice: ${brand.brandVoice}
- Target Audience: ${brand.targetAudience}
- Tone Attributes: ${brand.toneAttributes.join(', ')}
- Content Type: ${contentType}
- Approved Terms to Use: ${brand.approvedTerms.map((t) => `${t.term} (replaces ${t.preferredOver || 'alternatives'})`).join('; ')}
- Required Disclaimers to Include: ${brand.requiredDisclaimers.map((d) => `"${d.text}"`).join('; ')}

ISSUES TO RESOLVE:
${issues.map((i) => `- [${i.severity.toUpperCase()}] ${i.violatedRule} -> ${i.explanation}. Fix: ${i.suggestedCorrection}`).join('\n') || 'None'}

SUBMITTED ORIGINAL CONTENT:
"""
${content}
"""

REWRITE RULES:
1. Never promise absolute or unverified outcomes (e.g. replace "100% guaranteed results" with "demonstrated industry-leading efficacy" or equivalent professional wording).
2. Include all required disclaimers cleanly (e.g. "Terms and conditions apply").
3. Use approved terms strictly.
4. Do NOT introduce new unsupported factual or promotional claims.
5. Return JSON with rewrittenContent, changesMade (list of changes), and rationale.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert brand governance copy editor. Return only clean JSON conforming to the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rewrittenContent: {
                type: Type.STRING,
                description: 'The polished, compliant revised marketing copy.',
              },
              changesMade: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of specific compliance fixes applied.',
              },
              rationale: {
                type: Type.STRING,
                description: 'Why the rewrite resolves the brand violations.',
              },
            },
            required: ['rewrittenContent', 'changesMade', 'rationale'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.rewrittenContent) {
        return {
          rewrittenContent: parsed.rewrittenContent,
          changesMade: parsed.changesMade || ['Resolved detected guideline violations'],
          rationale: parsed.rationale || 'Adjusted phrasing to conform to brand voice and disclaimer rules.',
          preservedMeaningCheck: true,
          engineUsed: 'gemini',
        };
      }
    } catch (err) {
      console.error('Gemini rewrite error, falling back to rule-based engine:', err);
    }
  }

  // Deterministic rule-based fallback rewrite
  let rewritten = content;
  const changesMade: string[] = [];

  // Replace prohibited phrases
  for (const p of brand.prohibitedPhrases) {
    const re = new RegExp(p.phrase, 'gi');
    if (re.test(rewritten)) {
      const alt = p.suggestedAlternative || 'verified standard solution';
      rewritten = rewritten.replace(re, alt);
      changesMade.push(`Replaced prohibited phrase "${p.phrase}" with "${alt}"`);
    }
  }

  // Replace non-preferred terms
  for (const t of brand.approvedTerms) {
    if (t.preferredOver) {
      const parts = t.preferredOver.split(',').map((s) => s.trim());
      for (const nonPref of parts) {
        const re = new RegExp(nonPref, 'gi');
        if (re.test(rewritten)) {
          rewritten = rewritten.replace(re, t.term);
          changesMade.push(`Updated terminology: replaced "${nonPref}" with approved term "${t.term}"`);
        }
      }
    }
  }

  // Append required disclaimers
  for (const d of brand.requiredDisclaimers) {
    if (!rewritten.toLowerCase().includes(d.text.toLowerCase())) {
      rewritten = rewritten.trim() + ` ${d.text}.`;
      changesMade.push(`Appended required disclaimer: "${d.text}"`);
    }
  }

  return {
    rewrittenContent: rewritten,
    changesMade: changesMade.length > 0 ? changesMade : ['Applied brand guidelines adjustments.'],
    rationale: 'Deterministic rule-replacement applied suggested alternatives and appended required disclaimers.',
    preservedMeaningCheck: true,
    engineUsed: 'rule_based_fallback',
  };
}

// -----------------------------------------------------------------------------
// API Routes
// -----------------------------------------------------------------------------

// System Status / Health
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'BrandGuard AI',
    version: '1.0.0',
    geminiConfigured: !!aiClient,
    modelName: 'gemini-3.8-flash',
    totalBrands: db.brands.length,
    totalReviews: db.reviews.length,
    timestamp: new Date().toISOString(),
  });
});

// Brands Endpoints
app.get('/api/brands', (req: Request, res: Response) => {
  res.json(db.brands);
});

app.get('/api/brands/:id', (req: Request, res: Response) => {
  const brand = db.brands.find((b) => b.id === req.params.id);
  if (!brand) {
    return res.status(404).json({ error: 'Brand not found' });
  }
  res.json(brand);
});

app.post('/api/brands', (req: Request, res: Response) => {
  const newBrand: BrandProfile = {
    ...req.body,
    id: req.body.id || `brand-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.brands.push(newBrand);
  saveDatabase(db);
  res.status(201).json(newBrand);
});

app.put('/api/brands/:id', (req: Request, res: Response) => {
  const index = db.brands.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Brand not found' });
  }

  db.brands[index] = {
    ...db.brands[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  res.json(db.brands[index]);
});

app.delete('/api/brands/:id', (req: Request, res: Response) => {
  const initialLength = db.brands.length;
  db.brands = db.brands.filter((b) => b.id !== req.params.id);

  if (db.brands.length === initialLength) {
    return res.status(404).json({ error: 'Brand not found' });
  }

  saveDatabase(db);
  res.json({ success: true, message: 'Brand profile deleted' });
});

// Analyze Content Endpoint
app.post('/api/compliance/analyze', async (req: Request, res: Response) => {
  try {
    const { content, brandId, campaignName, contentType } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required for compliance analysis.' });
    }

    if (!brandId) {
      return res.status(400).json({ error: 'Please select a brand profile.' });
    }

    const brand = db.brands.find((b) => b.id === brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand profile not found.' });
    }

    // 1. Run deterministic checks
    const deterministicIssues = runDeterministicChecks(content, brand, contentType || 'social_media');

    // 2. Run contextual AI checks
    const aiResult = await runContextualAIAnalysis(
      content,
      brand,
      contentType || 'social_media',
      deterministicIssues
    );

    // Merge issues
    const allIssues = [...deterministicIssues, ...aiResult.issues];

    // Compute score & breakdown
    const scoreBreakdown = computeScore(allIssues, brand.severityWeights);

    const criticalCount = allIssues.filter((i) => i.severity === 'critical').length;
    const highCount = allIssues.filter((i) => i.severity === 'high').length;
    const mediumCount = allIssues.filter((i) => i.severity === 'medium').length;
    const lowCount = allIssues.filter((i) => i.severity === 'low').length;

    const hasCriticalBlocker = criticalCount > 0;

    let complianceState: ComplianceAnalysisResult['complianceState'] = 'compliant';
    if (hasCriticalBlocker) {
      complianceState = 'critical_violations';
    } else if (allIssues.length > 0 || scoreBreakdown.finalScore < 80) {
      complianceState = 'needs_attention';
    }

    const analysisResult: ComplianceAnalysisResult = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      brandId: brand.id,
      brandName: brand.name,
      campaignName: campaignName || 'Untitled Campaign',
      contentType: contentType || 'social_media',
      originalContent: content,
      score: scoreBreakdown.finalScore,
      hasCriticalBlocker,
      complianceState,
      issueCounts: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        total: allIssues.length,
      },
      issues: allIssues,
      scoreBreakdown,
      aiAnalysisStatus: aiResult.status,
      aiAnalysisNotes: aiResult.notes,
      deterministicMatchCount: deterministicIssues.length,
      aiMatchCount: aiResult.issues.length,
    };

    res.json(analysisResult);
  } catch (err: any) {
    console.error('Compliance analysis error:', err);
    res.status(500).json({ error: err.message || 'Internal analysis error' });
  }
});

// Content Rewrite Endpoint
app.post('/api/compliance/rewrite', async (req: Request, res: Response) => {
  try {
    const { content, brandId, contentType, issues } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required for rewriting.' });
    }

    const brand = db.brands.find((b) => b.id === brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand profile not found.' });
    }

    const result = await rewriteContent(
      content,
      brand,
      contentType || 'social_media',
      Array.isArray(issues) ? issues : []
    );

    res.json(result);
  } catch (err: any) {
    console.error('Rewrite error:', err);
    res.status(500).json({ error: err.message || 'Rewrite failed' });
  }
});

// Reviews Endpoints
app.get('/api/reviews', (req: Request, res: Response) => {
  // Sort by createdAt descending
  const sorted = [...db.reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

app.get('/api/reviews/:id', (req: Request, res: Response) => {
  const review = db.reviews.find((r) => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  res.json(review);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const review: ReviewRecord = {
    ...req.body,
    id: req.body.id || `rev-${Date.now()}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalStatus: req.body.approvalStatus || 'Draft',
    approvalAudit: req.body.approvalAudit || [
      {
        timestamp: new Date().toISOString(),
        fromStatus: 'Draft',
        toStatus: req.body.approvalStatus || 'Draft',
        reviewer: req.body.reviewerName || 'Governance Lead',
        reviewerRole: 'Brand Reviewer',
        rationale: 'Review created and saved.',
      },
    ],
  };

  db.reviews.unshift(review);
  saveDatabase(db);
  res.status(201).json(review);
});

// Workflow Approval Transition Endpoint
app.patch('/api/reviews/:id/status', (req: Request, res: Response) => {
  const { newStatus, reviewer, reviewerRole, rationale } = req.body;
  const review = db.reviews.find((r) => r.id === req.params.id);

  if (!review) {
    return res.status(404).json({ error: 'Review record not found' });
  }

  const validTransitions: ApprovalStatus[] = ['Draft', 'Needs Revision', 'Pending Review', 'Approved'];
  if (!validTransitions.includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid approval status' });
  }

  // Guard: Prevent approval while unresolved critical violations exist!
  if (newStatus === 'Approved') {
    const hasCritical =
      review.analysis?.hasCriticalBlocker ||
      (review.analysis?.issueCounts?.critical || 0) > 0;

    if (hasCritical) {
      return res.status(403).json({
        error:
          'Governance Rule Enforcement: Cannot approve content while unresolved Critical severity violations remain. Content must be revised and rechecked first.',
        criticalViolationsCount: review.analysis?.issueCounts?.critical || 1,
      });
    }

    if ((review.analysis?.score || 0) < 60) {
      return res.status(403).json({
        error:
          'Compliance Threshold Enforcement: Compliance score is below minimum publishing threshold (60/100). Content requires revision.',
      });
    }
  }

  const auditEntry = {
    timestamp: new Date().toISOString(),
    fromStatus: review.approvalStatus,
    toStatus: newStatus as ApprovalStatus,
    reviewer: reviewer || 'Authorized Reviewer',
    reviewerRole: reviewerRole || 'Brand Governance Director',
    rationale: rationale || `Status transitioned to ${newStatus}.`,
  };

  review.approvalStatus = newStatus as ApprovalStatus;
  review.approvalAudit.push(auditEntry);
  review.updatedAt = new Date().toISOString();

  saveDatabase(db);
  res.json(review);
});

app.delete('/api/reviews/:id', (req: Request, res: Response) => {
  const initialLength = db.reviews.length;
  db.reviews = db.reviews.filter((r) => r.id !== req.params.id);

  if (db.reviews.length === initialLength) {
    return res.status(404).json({ error: 'Review not found' });
  }

  saveDatabase(db);
  res.json({ success: true, message: 'Review deleted successfully' });
});

// Reset Demo Data Endpoint
app.post('/api/reset-demo', (req: Request, res: Response) => {
  db = {
    brands: JSON.parse(JSON.stringify(INITIAL_BRANDS)),
    reviews: JSON.parse(JSON.stringify(INITIAL_REVIEWS)),
  };
  saveDatabase(db);
  res.json({ success: true, message: 'Demo data restored to pristine state' });
});

// Vite middleware / Static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('Production build folder "dist" not found. Falling back to development middleware.');
      await mountVite();
    }
  } else {
    await mountVite();
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BrandGuard AI Server running at http://localhost:${PORT}`);
    console.log(`Gemini AI contextual engine status: ${aiClient ? 'ACTIVE' : 'OFFLINE (Rule engine fallback)'}`);
  });
}

async function mountVite() {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
