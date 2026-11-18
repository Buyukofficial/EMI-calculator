import React from 'react';
import { CalculationResults, MortgageInputs } from '../types/mortgage';
import { formatCurrency } from '../utils/calculations';
import { Wallet, Percent, CircleDollarSign, Landmark, ArrowRight, HelpCircle } from 'lucide-react';

interface SummaryCardsProps {
  results: CalculationResults;
  inputs: MortgageInputs;
  onOpenEmiHelp: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ results, inputs, onOpenEmiHelp }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print-break-inside-avoid">
      
      {/* Monthly EMI Card */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-105 transition-transform"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-emerald-600" />
              Monthly EMI
            </span>
            <button
              onClick={onOpenEmiHelp}
              className="text-slate-400 hover:text-emerald-700 transition-colors"
              title="What is EMI?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers">
            {formatCurrency(results.initialMonthlyEMI)}
            <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
          </div>

          <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
            Bi-Weekly: {formatCurrency(results.initialMonthlyEMI / 2)} / 2 wks
          </div>

          {results.hasVariableSwitch ? (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-emerald-700">Y1–Y{inputs.fixedYears}:</span>
              <span>{formatCurrency(results.initialMonthlyEMI)}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-indigo-700">Y{inputs.fixedYears + 1}+:</span>
              <span className="font-medium text-slate-800">{formatCurrency(results.secondaryMonthlyEMI)}</span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Fixed for all {inputs.tenureYears} years @ {inputs.initialRate}%
            </p>
          )}

          {/* +2% Stressed EMI quick view */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">+{inputs.stressTestBuffer}% CBUAE Stress EMI:</span>
            <span className="font-semibold text-amber-800 font-mono-numbers">
              {formatCurrency(results.stressTest.stressedMonthlyEMI)}
            </span>
          </div>
        </div>
      </div>

      {/* Total Interest Paid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-105 transition-transform"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-600" />
              Total Interest
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers">
            {formatCurrency(results.totalInterestPaid)}
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold font-mono-numbers text-[11px]">
              {results.interestPercentage.toFixed(1)}%
            </span>
            <span>of total loan repayment</span>
          </div>
        </div>
      </div>

      {/* Total Amount Payable */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-105 transition-transform"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-blue-600" />
              Total Payable
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers">
            {formatCurrency(results.totalAmountPayable)}
          </div>

          <div className="mt-2.5 text-xs text-slate-500 flex items-center gap-1">
            <span>Principal:</span>
            <span className="font-semibold text-slate-700">{formatCurrency(results.loanAmount)}</span>
          </div>
        </div>
      </div>

      {/* Total Upfront Cash Needed */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-105 transition-transform"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-purple-600" />
              Upfront Cash Needed
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers text-purple-900">
            {formatCurrency(results.totalUpfrontCashNeeded)}
          </div>

          <div className="mt-2.5 text-xs text-slate-500 flex flex-wrap gap-1">
            <span>Deposit:</span>
            <span className="font-semibold text-slate-700">{formatCurrency(inputs.downPaymentAmount)}</span>
            <span>+ Fees:</span>
            <span className="font-semibold text-slate-700">{formatCurrency(results.upfrontFees.totalFeesOnly)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
