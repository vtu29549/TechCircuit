import React from 'react';
import { X, Shield, Lock, FileCheck, AlertTriangle } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Privacy, Governance & AI Processing Notice
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-600 leading-relaxed">
          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-700" />
              1. Secure Server-Side Architecture
            </h4>
            <p>
              BrandGuard AI executes all Gemini API requests strictly within an isolated server-side Node.js environment. No API keys or credentials are ever transmitted to or stored in client-side browser code.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-teal-700" />
              2. Content Processing & Zero Retention by Default
            </h4>
            <p>
              Marketing copy submitted for analysis is processed via Google Gemini 3.8 Flash for contextual guideline evaluation and rewriting. Content is never used to train generalized foundation models. Stored reviews reside strictly within this application's persistent workspace store.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              3. Regulatory & Legal Disclaimer
            </h4>
            <p className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
              BrandGuard AI operates as an automated stylistic and brand guideline enforcement assistant. <strong>It does not certify or guarantee statutory, legal, copyright, trademark, or financial regulatory compliance.</strong> Enterprise organizations must continue to conduct requisite formal legal review for regulated claims.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              4. Single-User Demo Environment Notice
            </h4>
            <p>
              In this preview demonstration, authentication and role-based permissions operate in Single-User Reviewer mode. For production enterprise deployments, integrate with your corporate Identity Provider (SAML / Okta / Azure AD).
            </p>
          </section>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
