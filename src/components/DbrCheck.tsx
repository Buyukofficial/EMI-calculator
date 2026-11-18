import React from 'react';
import { MortgageInputs, CalculationResults } from '../types/mortgage';
import { formatCurrency } from '../utils/calculations';
import { ShieldAlert, CheckCircle2, HelpCircle, CreditCard, Banknote } from 'lucide-react';

interface DbrCheckProps {
  inputs: MortgageInputs;
  results: CalculationResults;
  onChange: (updates: Partial<MortgageInputs>) => void;
  onOpenDbrHelp: () => void;
}

export const DbrCheck: React.FC<DbrCheckProps> = ({
  inputs,
  results,
  onChange,
  onOpenDbrHelp
}) => {
  const totalCommitment = results.initialMonthlyEMI + (inputs.existingDebts || 0);
  const maxAllowedDebt = inputs.monthlyIncome * 0.5;
  const headroom = maxAllowedDebt - totalCommitment;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5 print-break-inside-avoid">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-slate-900">Affordability &amp; DBR Check</h2>
              <button
                type="button"
                onClick={onOpenDbrHelp}
                className="text-slate-400 hover:text-blue-700 transition-colors"
                title="What is Debt Burden Ratio?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              UAE Central Bank max 50% Debt Burden Ratio (DBR) regulation
            </p>
          </div>
        </div>

        {/* DBR Badge */}
        {inputs.monthlyIncome > 0 && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono-numbers flex items-center gap-1.5 ${
            results.isDbrExceeded
              ? 'bg-red-100 text-red-800 border border-red-200'
              : results.dbrRatio > 40
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            <span>DBR: {results.dbrRatio.toFixed(1)}%</span>
            <span className="text-[10px] font-normal opacity-80">(Max 50%)</span>
          </div>
        )}
      </div>

      {/* Income & Existing Debts Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly Income */}
        <div className="space-y-1.5">
          <label htmlFor="monthly-income" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-slate-500" />
            Monthly Net Income (AED)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              AED
            </span>
            <input
              id="monthly-income"
              type="number"
              min={0}
              step={1000}
              value={inputs.monthlyIncome || ''}
              onChange={(e) => onChange({ monthlyIncome: Number(e.target.value) || 0 })}
              placeholder="e.g. 35,000"
              className="w-full pl-12 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono-numbers focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Existing Monthly Debt Obligations */}
        <div className="space-y-1.5">
          <label htmlFor="existing-debts" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            Existing Monthly Debts (AED)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              AED
            </span>
            <input
              id="existing-debts"
              type="number"
              min={0}
              step={500}
              value={inputs.existingDebts || ''}
              onChange={(e) => onChange({ existingDebts: Number(e.target.value) || 0 })}
              placeholder="e.g. 2,500 (Car/Card loans)"
              className="w-full pl-12 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono-numbers focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Include 5% of credit card limits + car loans + personal loan EMIs
          </p>
        </div>
      </div>

      {/* Affordability Progress Bar & Analysis */}
      {inputs.monthlyIncome > 0 && (
        <div className="space-y-3 pt-1">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1.5">
              <span>Total Monthly Commitment: <strong>{formatCurrency(totalCommitment)}</strong></span>
              <span>50% Limit: <strong>{formatCurrency(maxAllowedDebt)}</strong></span>
            </div>
            
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
              {/* 50% Threshold marker line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10" title="50% Cap"></div>
              
              {/* Mortgage EMI slice */}
              <div
                style={{ width: `${Math.min(100, (results.initialMonthlyEMI / inputs.monthlyIncome) * 100)}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Mortgage EMI: ${((results.initialMonthlyEMI / inputs.monthlyIncome) * 100).toFixed(1)}%`}
              ></div>

              {/* Other debts slice */}
              <div
                style={{ width: `${Math.min(100, ((inputs.existingDebts || 0) / inputs.monthlyIncome) * 100)}%` }}
                className="bg-blue-400 h-full transition-all"
                title={`Other Debts: ${(((inputs.existingDebts || 0) / inputs.monthlyIncome) * 100).toFixed(1)}%`}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Mortgage EMI ({((results.initialMonthlyEMI / inputs.monthlyIncome) * 100).toFixed(1)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> Existing Debts ({(((inputs.existingDebts || 0) / inputs.monthlyIncome) * 100).toFixed(1)}%)
                </span>
              </div>
              <span className="font-semibold text-slate-600">50% Cap Marker</span>
            </div>
          </div>

          {/* DBR Warning or Success Banner */}
          {results.isDbrExceeded ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>DBR Limit Exceeded ({results.dbrRatio.toFixed(1)}% &gt; 50% Maximum Allowed)</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                Under UAE Central Bank regulations, financial institutions cannot approve mortgage financing where total monthly debt commitments exceed <strong>50% of verifiable income</strong>.
              </p>
              <div className="text-xs text-red-800 font-medium pt-1">
                You exceed the cap by <strong>{formatCurrency(Math.abs(headroom))} / month</strong>.
                To qualify, consider extending the tenure, lowering the loan amount, clearing credit cards/personal loans, or adding a joint co-borrower.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Affordable within UAE Guidelines:</strong> Total commitments represent {results.dbrRatio.toFixed(1)}% of your monthly income.
                </span>
              </div>
              <span className="font-medium text-emerald-800 ml-2 whitespace-nowrap">
                Headroom: {formatCurrency(headroom)}/mo
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
