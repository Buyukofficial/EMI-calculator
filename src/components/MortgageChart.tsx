import React, { useState } from 'react';
import { CalculationResults, MortgageInputs } from '../types/mortgage';
import { formatCurrency } from '../utils/calculations';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, LineChart as ChartIcon } from 'lucide-react';

interface MortgageChartProps {
  results: CalculationResults;
  inputs: MortgageInputs;
}

export const MortgageChart: React.FC<MortgageChartProps> = ({ results, inputs }) => {
  const [activeTab, setActiveTab] = useState<'donut' | 'amortization'>('donut');

  // Donut chart data
  const hasLoan = results.loanAmount > 0 || results.totalInterestPaid > 0;
  const donutData = hasLoan ? [
    { name: 'Loan Principal', value: results.loanAmount, color: '#10b981' }, // Emerald
    { name: 'Total Interest', value: results.totalInterestPaid, color: '#f59e0b' } // Amber
  ] : [
    { name: 'Zero Loan', value: 1, color: '#e2e8f0' }
  ];

  // Amortization timeline data (from yearly schedule)
  const timelineData = results.yearlySchedule.map(row => ({
    year: `Yr ${row.year}`,
    balance: Math.round(row.endingBalance),
    principalPaid: Math.round(row.totalPrincipal),
    interestPaid: Math.round(row.totalInterest)
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 print-break-inside-avoid space-y-5">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Visual Loan Analytics</h2>
          <p className="text-xs text-slate-500">Breakdown of principal repayment vs interest accumulation</p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold tab-buttons self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('donut')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'donut'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Principal vs Interest</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('amortization')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'amortization'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChartIcon className="w-3.5 h-3.5" />
            <span>Balance Reduction Curve</span>
          </button>
        </div>
      </div>

      {/* Donut Chart View */}
      {activeTab === 'donut' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          {/* Donut Graphic */}
          <div className="md:col-span-3 h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: number) => [formatCurrency(val), '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Overlay Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Total Payable</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono-numbers">
                {formatCurrency(results.totalAmountPayable)}
              </span>
              <span className="text-[10px] text-slate-500">
                over {inputs.tenureYears} yrs
              </span>
            </div>
          </div>

          {/* Legend and Key Statistics */}
          <div className="md:col-span-2 space-y-4">
            {/* Principal Row */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Loan Principal</div>
                  <div className="text-[11px] text-slate-500">{results.principalPercentage.toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="font-mono-numbers font-bold text-slate-900 text-sm">
                {formatCurrency(results.loanAmount)}
              </div>
            </div>

            {/* Interest Row */}
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Total Interest Paid</div>
                  <div className="text-[11px] text-slate-500">{results.interestPercentage.toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="font-mono-numbers font-bold text-slate-900 text-sm">
                {formatCurrency(results.totalInterestPaid)}
              </div>
            </div>

            {/* Insight Tip */}
            <p className="text-[11px] text-slate-400 leading-relaxed">
              For every <strong>AED 100</strong> you repay over {inputs.tenureYears} years, 
              approximately <strong>AED {results.principalPercentage.toFixed(0)}</strong> goes toward equity and <strong>AED {results.interestPercentage.toFixed(0)}</strong> goes toward bank interest.
            </p>
          </div>
        </div>
      )}

      {/* Amortization Curve View */}
      {activeTab === 'amortization' && (
        <div className="space-y-3">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip
                  formatter={(val: number) => [formatCurrency(val), 'Remaining Principal']}
                  labelFormatter={(lbl) => `${lbl} Schedule`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Curve illustrates annual remaining principal balance declining to AED 0 over the {inputs.tenureYears}-year tenure.
          </p>
        </div>
      )}
    </div>
  );
};
