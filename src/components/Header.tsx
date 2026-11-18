import React from 'react';
import { Building2, RotateCcw, Printer, HelpCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onPrint: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onPrint, onOpenHelp }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  UAE Mortgage EMI Calculator
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  CBUAE Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Dubai Land Department (DLD) fees &amp; Central Bank LTV rules
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 action-buttons self-end sm:self-auto">
            <button
              onClick={onOpenHelp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Learn about UAE mortgage rules & EMI calculation"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Guide &amp; FAQs</span>
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Reset inputs to UAE defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all shadow-emerald-600/25"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
