# BrandGuard AI — AI-Powered Brand Governance & Content Compliance Platform

> **Ensuring Consistent, Accurate, and Brand-Compliant Content Before Publication.**

BrandGuard AI is a full-stack enterprise governance SaaS application engineered for marketing, communications, and compliance teams. It solves the critical bottleneck of validating marketing collateral against corporate brand guidelines, legal disclaimers, approved terminology, and prohibited claims before publication.

---

## 🌟 Key Capabilities & Features

### 1. Dual-Engine Compliance Architecture
- **Deterministic Code Gate**: Instant regex and AST-style string matching for prohibited phrases (e.g., `"100% guaranteed results"`, `"zero risk"`, `"hack-proof"`), required regulatory disclaimers (`"Terms and conditions apply"`), approved corporate terminology (`"Zero Trust Architecture"` instead of `"perimeter security"`), and claim restrictions.
- **Contextual Gemini AI Engine (Google Gemini 3.8 Flash)**: Server-side LLM analysis evaluating brand voice tone, subtle policy conflicts, ungrounded superlatives, and audience alignment for enterprise CISO/IT leader personas.
- **Clear Provenance**: Findings explicitly state whether they originated from a **Deterministic Rule Match** or a **Contextual AI Assessment**.

### 2. Transparent Scoring & Governance Invariants
- **Transparent Mathematical Scoring**: Base score of 100 with clear, documented deductions:
  - Critical severity: `-35 pts`
  - High severity: `-20 pts`
  - Medium severity: `-10 pts`
  - Low severity: `-5 pts`
- **Strict Critical Blocker Invariant**: A high numerical score cannot override an unresolved Critical violation. If a critical issue exists, publication approval is **hard-blocked**.
- **Honest Legal Boundary**: Clearly distinguishes *"No configured rule violations detected"* from a legal guarantee, stating explicitly that BrandGuard AI does not certify statutory legal compliance.

### 3. AI Content Rewriter & Side-by-Side Harmonizer
- **Contextual Copy Rewriting**: Powered by Gemini 3.8 Flash to rewrite non-compliant copy, maintaining the original message and meaning while eliminating prohibited claims, incorporating disclaimers, and harmonizing voice.
- **Side-by-Side Comparison**: Compare original draft and revised draft side by side.
- **1-Click Recheck**: Instantly re-evaluates the revised draft against all brand rules to verify that compliance has been achieved.
- **Export & Copy**: Quick copy or `.txt` draft export.

### 4. Enterprise Review & Approval Workflow
- **Multi-State Lifecycle**: `Draft` → `Needs Revision` → `Pending Review` → `Approved`.
- **Enforced Sign-off Gates**: Prevents moving to `Approved` if unresolved Critical issues or low compliance scores remain.
- **Comprehensive Audit Trail**: Records reviewer name, timestamp, from/to status, and decision rationale.
- **Single-User Demo Disclosure**: Honestly identifies the environment as a Single-User Reviewer Demo mode rather than faking enterprise SSO/RBAC.

### 5. Brand Guidelines Management
- Full CRUD management of brand profiles:
  - Brand name, tagline, description, target audience.
  - Brand voice and tone attributes.
  - Prohibited phrases with severity levels, explanations, and suggested alternatives.
  - Required disclaimers with placement rules and triggering content types.
  - Approved terminology with "Preferred Over" substitutions.
  - Claim restrictions and severity weight matrices.
- Pre-loaded with official sample brand **NovaTech**.

### 6. Reports & Audit Dossiers
- **Tabular CSV Export**: Comprehensive export of review records, issue breakdowns, and timestamps.
- **Printable Compliance Certificate**: Clean HTML / PDF-ready printable dossier featuring executive findings, evidence quotes, and audit sign-off block.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   React 19 + TypeScript + Vite + Tailwind CSS               │
│   (Dashboard, ContentReview, BrandGuidelines, History)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (/api/*)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend (server.ts)              │
│   • Port 3000 / Vite Middleware                             │
│   • In-Memory Cache + Persistent Disk Store (data/db.json)  │
├──────────────────────────────┬──────────────────────────────┤
│ Deterministic Rule Engine    │ Google Gemini Server Client  │
│  - Prohibited Phrases        │  - Gemini 3.8 Flash Model    │
│  - Missing Disclaimers       │  - Contextual Voice Analysis │
│  - Approved Terminology      │  - Compliant Copy Rewriter   │
│  - Claim Restrictions        │  - Managed Secrets on Server │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js >= 20.x
- npm >= 9.x
- Google Gemini API Key (configured in environment secrets or `.env`)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/brandguard-ai.git
   cd brandguard-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

5. **Typecheck & Build for Production**:
   ```bash
   npm run lint
   npm run build
   npm start
   ```

---

## 🧪 Hackathon Demo Workflow (Step-by-Step for Judges)

1. **Open Dashboard**:
   Click the **"Try Demo Workflow"** or **"Launch Demo Workflow"** button.
2. **Review Initial Intentional Violations**:
   The sample marketing copy:
   `"Get 100% guaranteed results with our new solution. Sign up today."`
   is loaded against the **NovaTech** brand profile.
3. **Inspect the Compliance Scan**:
   - **Critical Violation**: Catches `"100% guaranteed results"` (Prohibited Phrase Rule).
   - **High Severity Issue**: Flags missing disclaimer `"Terms and conditions apply"`.
   - **Score**: Transparently calculated at `25/100` or `45/100`.
   - **Approval Blocker**: Notice that the status is set to `Needs Revision` and `Approved` is hard-blocked.
4. **Generate AI Compliant Rewrite**:
   Click **"Rewrite Content"**. Watch Gemini 3.8 Flash generate an executive, professional revision replacing the guarantee with *"demonstrated industry-leading efficacy"* and appending *"Terms and conditions apply"*.
5. **Recheck Content**:
   Click **"Recheck Content Against Brand Rules"**. Notice the score updates to compliant, the critical blocker clears, and the review can be submitted and moved to `Approved`.
6. **Export Compliance Report**:
   Click **"View Report / Export"** to inspect the printable audit certificate or download a structured CSV report.

---

## 🔒 Security & Privacy Practices

- **Zero Client-Side Secret Exposure**: `GEMINI_API_KEY` is exclusively read and utilized inside `server.ts`. Client bundles contain zero API keys.
- **Fail-Safe Offline Mode**: If the Gemini API key is missing or unavailable, the application gracefully continues operating using the deterministic rule engine without crashing or fabricating outputs.
- **Data Persistence**: Reviews and brand guidelines persist across page reloads in `data/db.json`.

---

## 📄 License
Apache-2.0
