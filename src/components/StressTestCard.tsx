import React from 'react';
import { CalculationResults, MortgageInputs } from '../types/mortgage';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface StressTestCardProps {
  results: CalculationResults;
  inputs: MortgageInputs;
  onChange: (updates: Partial<MortgageInputs>) => void;
  onOpenStressHelp: () => void;
}

export const StressTestCard: React.FC<StressTestCardProps> = ({
  results,
  inputs,
  onChange,
  onOpenStressHelp
}) => {
  const st = results.stressTest;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5 print-break-inside-avoid">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Interest Rate Stress Test (+{st.bufferPercent.toFixed(1)}%)
              </h2>
              <button
                type="button"
                onClick={onOpenStressHelp}
                className="text-slate-400 hover:text-amber-700 transition-colors"
                title="What is the Central Bank 2% stress test?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              UAE Central Bank mandatory affordability buffer (+200 bps)
            </p>
          </div>
        </div>

        {/* Buffer Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          {[1.5, 2.0, 2.5, 3.0].map(buf => (
            <button
              key={buf}
              type="button"
              onClick={() => onChange({ stressTestBuffer: buf })}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                inputs.stressTestBuffer === buf
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              +{buf.toFixed(1)}%{buf === 2.0 && ' (CBUAE)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Stressed Rate */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Stressed Rate
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-mono-numbers">
            {st.stressedInitialRate.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Base {inputs.initialRate}% + {st.bufferPercent}% buffer
          </p>
        </div>

        {/* Stressed Monthly EMI */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block mb-1">
            Stressed Monthly EMI
          </span>
          <div className="text-xl font-extrabold text-amber-950 font-mono-numbers">
            {formatCurrency(st.stressedMonthlyEMI)}
            <span className="text-xs font-normal text-amber-700 ml-1">/mo</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
            +{formatCurrency(st.monthlyDifference)}/mo (+{st.percentIncrease.toFixed(1)}%)
          </p>
        </div>

        {/* Lifetime Interest Impact */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Extra Lifetime Interest
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-mono-numbers">
            +{formatCurrency(st.additionalLifetimeInterest)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Total interest: {formatCurrency(st.stressedTotalInterest)}
          </p>
        </div>
      </div>

      {/* Stressed DBR Compliance Bar & Alert */}
      {inputs.monthlyIncome > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Stressed DBR Affordability Evaluation
            </span>
            <span className={`font-bold font-mono-numbers px-2.5 py-0.5 rounded-full ${
              st.isStressedDbrExceeded
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              Stressed DBR: {st.stressedDbrRatio.toFixed(1)}% (Base: {results.dbrRatio.toFixed(1)}%)
            </span>
          </div>

          {/* Stressed Progress Bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
            {/* 50% CBUAE Threshold marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500 z-10" title="50% Cap"></div>
            
            {/* Stressed EMI share */}
            <div
              style={{ width: `${Math.min(100, (st.stressedMonthlyEMI / inputs.monthlyIncome) * 100)}%` }}
              className={`h-full transition-all ${st.isStressedDbrExceeded ? 'bg-red-500' : 'bg-amber-500'}`}
            ></div>

            {/* Other debts share */}
            <div
              style={{ width: `${Math.min(100, ((inputs.existingDebts || 0) / inputs.monthlyIncome) * 100)}%` }}
              className="bg-blue-400 h-full transition-all"
            ></div>
          </div>

          {/* Result Banner */}
          {st.isStressedDbrExceeded ? (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-red-800">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Stress Test Failed: DBR exceeds 50% under a +{st.bufferPercent}% rate shock</span>
              </div>
              <p className="text-red-700 leading-relaxed">
                While your current DBR is <strong>{results.dbrRatio.toFixed(1)}%</strong>, an interest rate increase of {st.bufferPercent}% pushes your total debt service to <strong>{st.stressedDbrRatio.toFixed(1)}%</strong> of your income. Under UAE Central Bank stress-test standards, banks may reduce the maximum loan amount they offer you or require a larger down payment.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Stress Test Passed:</strong> You remain within the 50% CBUAE limit even if interest rates rise by +{st.bufferPercent}%.
                </span>
              </div>
              <span className="font-semibold text-emerald-800 ml-2 font-mono-numbers whitespace-nowrap">
                Buffer Headroom: {formatCurrency(st.stressedHeadroom)}/mo
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footnote note */}
      <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
        <strong>Why UAE Banks Stress Test:</strong> UAE Central Bank requires retail lenders to verify that borrowers can comfortably absorb future interest rate increases or EIBOR fluctuations without defaulting on payments.
      </p>
    </div>
  );
};
