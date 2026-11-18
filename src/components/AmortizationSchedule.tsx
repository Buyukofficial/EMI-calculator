import React, { useState } from 'react';
import { CalculationResults, MortgageInputs } from '../types/mortgage';
import { formatCurrency, exportAmortizationToCSV } from '../utils/calculations';
import { Download, Table, ArrowRightLeft } from 'lucide-react';

interface AmortizationScheduleProps {
  results: CalculationResults;
  inputs: MortgageInputs;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({ results, inputs }) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [visibleMonths, setVisibleMonths] = useState<number>(36); // Progressive loading for 300 months

  const handleExportCSV = () => {
    if (viewMode === 'monthly') {
      exportAmortizationToCSV(
        results.amortizationSchedule,
        'monthly',
        inputs.propertyPrice,
        results.loanAmount
      );
    } else {
      exportAmortizationToCSV(
        results.yearlySchedule,
        'yearly',
        inputs.propertyPrice,
        results.loanAmount
      );
    }
  };

  const fixedMonthsCount = inputs.fixedYears * 12;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden print-break-inside-avoid">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Amortization Schedule</h2>
            <p className="text-xs text-slate-500">
              {viewMode === 'yearly' 
                ? `${results.yearlySchedule.length} Year Summary`
                : `${results.amortizationSchedule.length} Months Total Breakdown`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 tab-buttons">
          {/* Yearly vs Monthly Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly View
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            title="Download CSV amortization table"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Switch Notice Banner */}
      {results.hasVariableSwitch && (
        <div className="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100/80 text-xs text-indigo-900 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Fixed to Variable Rate Transition:</strong> Rate switches from <strong>{inputs.initialRate}%</strong> (Years 1–{inputs.fixedYears}) 
            to <strong>{inputs.variableRate}%</strong> (Month {fixedMonthsCount + 1} / Year {inputs.fixedYears + 1} onwards).
          </span>
        </div>
      )}

      {/* Table Container with Sticky Header */}
      <div className="max-h-[500px] overflow-y-auto overflow-x-auto relative touch-scroll">
        <table className="w-full min-w-[580px] text-left text-xs sm:text-sm border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
            {viewMode === 'yearly' ? (
              <tr>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Annual Payment</th>
                <th className="py-3 px-4 text-emerald-800">Principal Paid</th>
                <th className="py-3 px-4 text-amber-800">Interest Paid</th>
                <th className="py-3 px-4 text-right">Ending Balance</th>
                <th className="py-3 px-4 text-right">Rate</th>
              </tr>
            ) : (
              <tr>
                <th className="py-3 px-4"># Month</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">EMI Payment</th>
                <th className="py-3 px-4 text-emerald-800">Principal</th>
                <th className="py-3 px-4 text-amber-800">Interest</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-right">Rate</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-100 font-mono-numbers">
            {viewMode === 'yearly' ? (
              // Yearly Rows
              results.yearlySchedule.map((row) => {
                const isSwitchYear = results.hasVariableSwitch && row.year === inputs.fixedYears;
                return (
                  <tr
                    key={row.year}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSwitchYear ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                      Year {row.year}
                      {isSwitchYear && (
                        <span className="ml-2 text-[10px] font-medium text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                          Fixed Ends
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {formatCurrency(row.totalPayment)}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">
                      {formatCurrency(row.totalPrincipal)}
                    </td>
                    <td className="py-3 px-4 text-amber-700 font-semibold">
                      {formatCurrency(row.totalInterest)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(row.endingBalance)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-sans text-xs">
                      {row.effectiveRate.toFixed(2)}%
                    </td>
                  </tr>
                );
              })
            ) : (
              // Monthly Rows
              results.amortizationSchedule.slice(0, visibleMonths).map((row) => {
                const isSwitchMonth = results.hasVariableSwitch && row.month === fixedMonthsCount + 1;
                return (
                  <tr
                    key={row.month}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSwitchMonth ? 'bg-indigo-50/70 border-t-2 border-indigo-400' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-slate-900 font-sans flex items-center gap-1.5">
                      <span>M{row.month}</span>
                      {isSwitchMonth && (
                        <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-sans">
                          Variable Starts
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans text-xs">
                      Year {row.year}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {formatCurrency(row.payment)}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-700">
                      {formatCurrency(row.principal)}
                    </td>
                    <td className="py-2.5 px-4 text-amber-700">
                      {formatCurrency(row.interest)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(row.remainingBalance)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-500 font-sans text-xs">
                      {row.rateApplied.toFixed(2)}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Show more button if in monthly view and more months exist */}
      {viewMode === 'monthly' && visibleMonths < results.amortizationSchedule.length && (
        <div className="p-3 text-center border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={() => setVisibleMonths(prev => Math.min(results.amortizationSchedule.length, prev + 36))}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
          >
            Show more months ({visibleMonths} of {results.amortizationSchedule.length} displayed)...
          </button>
        </div>
      )}
    </div>
  );
};
