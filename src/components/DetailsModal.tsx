import React, { useState } from 'react';
import { X, Download, Table, Building2, ShieldCheck, Zap, Scale, Receipt } from 'lucide-react';
import { formatCurrency, formatNumber, exportAmortizationToCSV } from '../utils/calculations';
import { AmortizationRow, YearlyAmortizationRow } from '../types/mortgage';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  processingFeeAmount: number;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  currency,
  loanAmount,
  interestRate,
  tenureYears,
  monthlyEMI,
  totalInterest,
  totalPayment,
  processingFeeAmount
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'uae_rules'>('schedule');
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');

  if (!isOpen) return null;

  // Build schedules
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));
  const monthlyRate = (interestRate / 12) / 100;
  const monthlySchedule: AmortizationRow[] = [];

  let balance = loanAmount;
  let accumulatedInterest = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const interestPart = balance * monthlyRate;
    let principalPart = monthlyEMI - interestPart;

    if (m === totalMonths || principalPart > balance) {
      principalPart = balance;
      balance = 0;
    } else {
      balance = Math.max(0, balance - principalPart);
    }

    accumulatedInterest += interestPart;

    monthlySchedule.push({
      month: m,
      year: Math.ceil(m / 12),
      payment: monthlyEMI,
      principal: principalPart,
      interest: interestPart,
      remainingBalance: balance,
      rateApplied: interestRate
    });
  }

  // Yearly Schedule
  const yearlyMap = new Map<number, YearlyAmortizationRow>();
  for (const row of monthlySchedule) {
    if (!yearlyMap.has(row.year)) {
      yearlyMap.set(row.year, {
        year: row.year,
        totalPayment: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        endingBalance: row.remainingBalance,
        effectiveRate: row.rateApplied
      });
    }
    const yr = yearlyMap.get(row.year)!;
    yr.totalPayment += row.payment;
    yr.totalPrincipal += row.principal;
    yr.totalInterest += row.interest;
    yr.endingBalance = row.remainingBalance;
  }
  const yearlySchedule = Array.from(yearlyMap.values());

  const handleExport = () => {
    exportAmortizationToCSV(
      viewMode === 'monthly' ? monthlySchedule : yearlySchedule,
      viewMode,
      loanAmount * 1.25, // estimated property price
      loanAmount
    );
  };

  // UAE Fees estimate
  const estimatedPrice = loanAmount > 0 ? Math.round(loanAmount / 0.8) : 0;
  const dldFee = estimatedPrice * 0.04;
  const agencyCommission = estimatedPrice * 0.02 * 1.05;
  const bankFee = loanAmount > 0 ? Math.max(10000, loanAmount * 0.01) * 1.05 : 0;
  const valuation = loanAmount > 0 ? 3150 : 0;
  const mortgageReg = loanAmount > 0 ? (loanAmount * 0.0025) + 290 : 0;
  const trusteeFee = estimatedPrice >= 500000 ? 4200 : 2100;
  const totalFees = dldFee + agencyCommission + bankFee + valuation + mortgageReg + trusteeFee;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Loan Details &amp; Amortization</h2>
            <p className="text-xs text-slate-500">
              Loan: {currency} {formatNumber(loanAmount)} &bull; Rate: {interestRate}% &bull; {tenureYears} Years
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 border-b-2 transition-all ${
              activeTab === 'schedule'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Amortization Schedule
          </button>
          <button
            onClick={() => setActiveTab('uae_rules')}
            className={`pb-3 px-3 border-b-2 transition-all ${
              activeTab === 'uae_rules'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            UAE Central Bank Rules &amp; Fees
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'schedule' ? (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setViewMode('yearly')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      viewMode === 'yearly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Yearly ({yearlySchedule.length} yrs)
                  </button>
                  <button
                    onClick={() => setViewMode('monthly')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Monthly ({monthlySchedule.length} mos)
                  </button>
                </div>

                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse font-mono-numbers">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 z-10">
                    {viewMode === 'yearly' ? (
                      <tr>
                        <th className="py-2.5 px-3">Year</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3 text-emerald-700">Principal</th>
                        <th className="py-2.5 px-3 text-amber-700">Interest</th>
                        <th className="py-2.5 px-3 text-right">Balance</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="py-2.5 px-3"># Month</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3 text-emerald-700">Principal</th>
                        <th className="py-2.5 px-3 text-amber-700">Interest</th>
                        <th className="py-2.5 px-3 text-right">Balance</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewMode === 'yearly'
                      ? yearlySchedule.map(row => (
                          <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 font-bold text-slate-900 font-sans">Year {row.year}</td>
                            <td className="py-2 px-3">{currency} {formatNumber(Math.round(row.totalPayment))}</td>
                            <td className="py-2 px-3 text-emerald-700">{currency} {formatNumber(Math.round(row.totalPrincipal))}</td>
                            <td className="py-2 px-3 text-amber-700">{currency} {formatNumber(Math.round(row.totalInterest))}</td>
                            <td className="py-2 px-3 text-right font-bold">{currency} {formatNumber(Math.round(row.endingBalance))}</td>
                          </tr>
                        ))
                      : monthlySchedule.map(row => (
                          <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                            <td className="py-1.5 px-3 font-semibold text-slate-900 font-sans">M{row.month}</td>
                            <td className="py-1.5 px-3">{currency} {formatNumber(Math.round(row.payment))}</td>
                            <td className="py-1.5 px-3 text-emerald-700">{currency} {formatNumber(Math.round(row.principal))}</td>
                            <td className="py-1.5 px-3 text-amber-700">{currency} {formatNumber(Math.round(row.interest))}</td>
                            <td className="py-1.5 px-3 text-right font-semibold">{currency} {formatNumber(Math.round(row.remainingBalance))}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* UAE Central Bank Rules & Acquisition Fees */
            <div className="space-y-5 text-xs text-slate-700">
              {/* LTV & DBR Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Central Bank of the UAE (CBUAE) Guidelines</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-1">Max LTV Limits</span>
                    <ul className="space-y-0.5 text-slate-600">
                      <li>&bull; UAE Residents: <strong>85% LTV</strong> (&le; 5M AED) / 75% (&gt; 5M)</li>
                      <li>&bull; Non-Residents: <strong>80% LTV</strong> (&le; 5M AED) / 70% (&gt; 5M)</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-1">DBR &amp; Stress Test</span>
                    <ul className="space-y-0.5 text-slate-600">
                      <li>&bull; Max Debt Burden Ratio: <strong>50% of income</strong></li>
                      <li>&bull; CBUAE Rate Stress Test: <strong>+2.00% (200 bps)</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* UAE Acquisition Fees Breakdown */}
              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-purple-950 text-sm">
                    <Receipt className="w-4 h-4 text-purple-600" />
                    <span>Estimated UAE Acquisition Fees (~AED {formatNumber(totalFees)})</span>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-800">Property ~{currency} {formatNumber(estimatedPrice)}</span>
                </div>

                <div className="divide-y divide-purple-100/80">
                  <div className="py-2 flex justify-between">
                    <span>DLD Transfer Fee (4%)</span>
                    <span className="font-mono-numbers font-semibold">AED {formatNumber(dldFee)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Agency Brokerage (2% + 5% VAT)</span>
                    <span className="font-mono-numbers font-semibold">AED {formatNumber(agencyCommission)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Bank Processing Fee (1% + 5% VAT)</span>
                    <span className="font-mono-numbers font-semibold">AED {formatNumber(bankFee)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Mortgage Registration (0.25% + AED 290)</span>
                    <span className="font-mono-numbers font-semibold">AED {formatNumber(mortgageReg)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Valuation &amp; Trustee Fee</span>
                    <span className="font-mono-numbers font-semibold">AED {formatNumber(valuation + trusteeFee)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
