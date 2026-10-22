import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  BookMarked,
  History,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Cpu,
  Info,
} from 'lucide-react';
import logoImg from '../assets/images/brandguard_logo_symbol_1792661837071.jpg';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLaunchDemo: () => void;
  onResetDemo: () => void;
  geminiConnected: boolean;
  onOpenPrivacyNotice: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onLaunchDemo,
  onResetDemo,
  geminiConnected,
  onOpenPrivacyNotice,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-review', label: 'New Content Review', icon: FileCheck2 },
    { id: 'guidelines', label: 'Brand Guidelines', icon: BookMarked },
    { id: 'history', label: 'Review History', icon: History },
    { id: 'reports', label: 'Compliance Reports', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-sm">
          <img
            src={logoImg}
            alt="BrandGuard AI Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
            <span>BrandGuard</span>
            <span className="text-teal-400 font-semibold text-xs tracking-wider uppercase bg-teal-950/70 border border-teal-500/30 px-1 py-0.5 rounded">
              AI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Content Compliance</p>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-teal-600/15 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-teal-400' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Demo Callout Button */}
        <div className="pt-4 px-2">
          <button
            onClick={onLaunchDemo}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-semibold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Try Demo Workflow</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-1 px-1">
            Loads NovaTech sample with intentional rule violations
          </p>
        </div>
      </nav>

      {/* Engine Status & System Info */}
      <div className="p-3 mx-3 mb-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            Compliance Engines
          </span>
          <span className="text-[10px] text-teal-300 font-mono">v1.0</span>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Deterministic Checks</span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Gemini 3.8 Contextual</span>
            <span
              className={`font-medium ${
                geminiConnected ? 'text-teal-400' : 'text-amber-400'
              }`}
            >
              {geminiConnected ? 'Connected' : 'Offline Fallback'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <button
            onClick={onOpenPrivacyNotice}
            className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            <span>Privacy & Policy</span>
          </button>
          <button
            onClick={onResetDemo}
            title="Reset to default demonstration data"
            className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
