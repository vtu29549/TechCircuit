import React from 'react';
import { Sparkles, Shield, ChevronRight, User } from 'lucide-react';
import avatarImg from '../assets/images/avatar_governance_lead_1792661838232.jpg';

interface HeaderProps {
  currentTab: string;
  onLaunchDemo: () => void;
  onNewReviewClick: () => void;
  brandCount: number;
  reviewCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onLaunchDemo,
  onNewReviewClick,
}) => {
  const getTabLabel = (id: string) => {
    switch (id) {
      case 'dashboard':
        return 'Executive Overview';
      case 'new-review':
        return 'Content Review & Compliance';
      case 'guidelines':
        return 'Brand Governance Guidelines';
      case 'history':
        return 'Audit History';
      case 'reports':
        return 'Compliance Reporting';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 shrink-0 select-none">
      {/* Zone 1: Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap shrink-0">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-teal-600" />
          BrandGuard AI
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-medium">
          {getTabLabel(currentTab)}
        </span>
      </div>

      {/* Zone 2: Informational trust indicator */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 whitespace-nowrap">
        <span className="text-slate-400">Environment</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
          Single-User Reviewer Demo
        </span>
        <span className="text-slate-300">/</span>
        <span>Deterministic Rule Gate & Gemini Contextual Engine</span>
      </div>

      {/* Zone 3: Actions & User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onLaunchDemo}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Load NovaTech Demo</span>
        </button>

        {currentTab !== 'new-review' && (
          <button
            onClick={onNewReviewClick}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            New Review
          </button>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
            <img
              src={avatarImg}
              alt="Brand Governance Lead Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="hidden md:block text-left text-xs leading-tight">
            <div className="font-semibold text-slate-800">Pravallika Reddy</div>
            <div className="text-[11px] text-slate-500">Brand Governance Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
};
