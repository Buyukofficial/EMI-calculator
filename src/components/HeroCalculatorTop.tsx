import React, { useState } from 'react';
import { MortgageInputs, CalculationResults } from '../types/mortgage';
import { UAE_BANK_PRESETS, formatCurrency, formatNumber } from '../utils/calculations';
import { 
  CircleDollarSign, 
  Percent, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Building, 
  Sparkles,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

interface HeroCalculatorTopProps {
  inputs: MortgageInputs;
  results: CalculationResults;
  onChange: (updates: Partial<MortgageInputs>) => void;
  onOpenHelp: (topic: 'emi' | 'dbr' | 'ltv' | 'stress' | 'all') => void;
}

export const HeroCalculatorTop: React.FC<HeroCalculatorTopProps> = ({
  inputs,
  results,
  onChange,
  onOpenHelp
}) => {
  const [showPropertyDetails, setShowPropertyDetails] = useState<boolean>(false);
  const st = results.stressTest;

  // Handle direct Loan Amount editing (allows 0 or any custom amount)
  const handleLoanAmountChange = (newLoan: number) => {
    const validLoan = isNaN(newLoan) ? 0 : Math.max(0, newLoan);
    if (validLoan === 0) {
      onChange({
        propertyPrice: 0,
        downPaymentAmount: 0
      });
      return;
    }
    // Keep down payment percentage, update property price & down payment AED
    const downPct = inputs.downPaymentPercent > 0 ? inputs.downPaymentPercent : 20;
    const ltvRatio = (100 - downPct) / 100;
    const newPrice = Math.round(validLoan / (ltvRatio > 0 ? ltvRatio : 0.8));
    const newDown = newPrice - validLoan;
    onChange({
      propertyPrice: newPrice,
      downPaymentAmount: newDown
    });
  };

  // Handle Property Price Change
  const handlePriceChange = (price: number) => {
    const validPrice = isNaN(price) ? 0 : Math.max(0, price);
    const newDown = Math.round((validPrice * inputs.downPaymentPercent) / 100);
    onChange({
      propertyPrice: validPrice,
      downPaymentAmount: newDown
    });
  };

  // Handle Down Payment % Change
  const handlePercentChange = (pct: number) => {
    const validPct = isNaN(pct) ? 0 : Math.max(0, Math.min(pct, 100));
    const newAmount = Math.round((inputs.propertyPrice * validPct) / 100);
    onChange({
      downPaymentPercent: validPct,
      downPaymentAmount: newAmount
    });
  };

  // Preset selector handler
  const handlePresetSelect = (presetId: string) => {
    const preset = UAE_BANK_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onChange({
        rateStructure: 'fixed_variable',
        initialRate: preset.fixedRate,
        fixedYears: preset.fixedYears,
        variableRate: preset.variableRate
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden print-break-inside-avoid">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Primary Loan Parameters
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Follow the 5 key mortgage steps below
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-white mt-1">
              Loan Amount &bull; Rate &bull; Tenure &bull; Stress Rate &bull; Eligibility
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
            <span className="text-slate-400">Residency:</span>
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => onChange({ residencyStatus: 'resident' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  inputs.residencyStatus === 'resident'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                UAE Resident
              </button>
              <button
                type="button"
                onClick={() => onChange({ residencyStatus: 'non_resident' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  inputs.residencyStatus === 'non_resident'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Non-Resident / Expat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Grid on Top */}
      <div className="p-3.5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-5 items-start">
          
          {/* STEP 1: LOAN AMOUNT OR TARGET EMI */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                  {inputs.calculationMode === 'target_emi' ? 'Target EMI' : 'Loan Amount'}
                </span>
                
                {/* Mode Switcher Toggle */}
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-md text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => onChange({ calculationMode: 'loan_amount' })}
                    className={`px-1.5 py-0.5 rounded ${
                      inputs.calculationMode === 'loan_amount' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Calculate EMI from Loan Amount"
                  >
                    Loan
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ calculationMode: 'target_emi', targetEMI: inputs.targetEMI || Math.round(results.initialMonthlyEMI) })}
                    className={`px-1.5 py-0.5 rounded ${
                      inputs.calculationMode === 'target_emi' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Calculate Affordable Loan from Monthly Budget EMI"
                  >
                    By EMI
                  </button>
                </div>
              </div>

              {inputs.calculationMode === 'target_emi' ? (
                // Target EMI Input (allows 0 or any number)
                <>
                  <div className="mt-2.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      AED
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={inputs.targetEMI === 0 ? '' : inputs.targetEMI}
                      placeholder="0"
                      onChange={(e) => onChange({ targetEMI: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full pl-12 pr-3 py-2 bg-white border border-emerald-300 rounded-xl text-base font-extrabold text-emerald-950 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      aria-label="Target monthly EMI budget in AED"
                    />
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={50000}
                    step={250}
                    value={inputs.targetEMI || 0}
                    onChange={(e) => onChange({ targetEMI: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                  />
                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                    Affords Loan: AED {formatNumber(results.loanAmount)}
                  </div>
                </>
              ) : (
                // Standard Loan Amount Input (allows 0 or any custom amount as desired)
                <>
                  <div className="mt-2.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      AED
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={results.loanAmount === 0 ? '' : results.loanAmount}
                      placeholder="0"
                      onChange={(e) => handleLoanAmountChange(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      aria-label="Mortgage loan amount in AED"
                    />
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={15000000}
                    step={10000}
                    value={results.loanAmount || 0}
                    onChange={(e) => handleLoanAmountChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                  />
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    LTV: {inputs.propertyPrice > 0 ? 100 - inputs.downPaymentPercent : 0}% (Deposit: AED {formatNumber(inputs.downPaymentAmount)})
                  </div>
                </>
              )}
            </div>

            {/* Property Price & Down Payment Toggle button */}
            <div className="pt-1 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setShowPropertyDetails(!showPropertyDetails)}
                className="w-full flex items-center justify-between text-[11px] text-slate-600 hover:text-emerald-800 font-medium py-1"
              >
                <span>Price: AED {formatNumber(inputs.propertyPrice)}</span>
                <span className="flex items-center text-emerald-700 font-semibold">
                  {showPropertyDetails ? 'Hide' : 'Edit Price/Down'}
                  {showPropertyDetails ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                </span>
              </button>
            </div>
          </div>

          {/* STEP 2: INTEREST RATE */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                  Interest Rate
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {inputs.interestType === 'reducing' ? 'Reducing' : 'Flat'}
                </span>
              </div>

              <div className="mt-2.5 relative">
                <input
                  type="number"
                  min={1}
                  max={15}
                  step={0.05}
                  value={inputs.initialRate}
                  onChange={(e) => onChange({ initialRate: Number(e.target.value) })}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  aria-label="Annual interest rate percentage"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  % p.a.
                </span>
              </div>

              {/* UAE Bank Preset select */}
              <div className="mt-2">
                <select
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  defaultValue="enbd_3yr"
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {UAE_BANK_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between">
              <span>{inputs.fixedYears} yrs fixed</span>
              <span className="text-indigo-700 font-medium">then {inputs.variableRate}% var.</span>
            </div>
          </div>

          {/* STEP 3: TENURE (YEARS & MONTHS BOTH) */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                  Tenure
                </span>

                {/* Years vs Months Unit Toggle */}
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-md text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => onChange({ tenureUnit: 'years' })}
                    className={`px-1.5 py-0.5 rounded ${
                      inputs.tenureUnit === 'years' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ 
                      tenureUnit: 'months', 
                      tenureMonths: inputs.tenureMonths || inputs.tenureYears * 12 
                    })}
                    className={`px-1.5 py-0.5 rounded ${
                      inputs.tenureUnit === 'months' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Months
                  </button>
                </div>
              </div>

              {inputs.tenureUnit === 'months' ? (
                // Months Input & Slider
                <>
                  <div className="mt-2.5 relative">
                    <input
                      type="number"
                      min={12}
                      max={300}
                      step={6}
                      value={inputs.tenureMonths || inputs.tenureYears * 12}
                      onChange={(e) => {
                        const m = Math.max(12, Math.min(300, Number(e.target.value)));
                        onChange({ tenureMonths: m, tenureYears: Math.round(m / 12) });
                      }}
                      className="w-full pl-3 pr-16 py-2 bg-white border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      aria-label="Loan tenure in months"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Months
                    </span>
                  </div>

                  <input
                    type="range"
                    min={12}
                    max={300}
                    step={6}
                    value={inputs.tenureMonths || inputs.tenureYears * 12}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      onChange({ tenureMonths: m, tenureYears: Math.round(m / 12) });
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                  />

                  <div className="text-[11px] text-slate-500 mt-1">
                    = {((inputs.tenureMonths || inputs.tenureYears * 12) / 12).toFixed(1)} Years
                  </div>
                </>
              ) : (
                // Years Input & Slider
                <>
                  <div className="mt-2.5 relative">
                    <input
                      type="number"
                      min={1}
                      max={25}
                      step={1}
                      value={inputs.tenureYears}
                      onChange={(e) => {
                        const y = Math.max(1, Math.min(25, Number(e.target.value)));
                        onChange({ tenureYears: y, tenureMonths: y * 12 });
                      }}
                      className="w-full pl-3 pr-14 py-2 bg-white border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      aria-label="Loan tenure in years"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Years
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={25}
                    step={1}
                    value={inputs.tenureYears}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      onChange({ tenureYears: y, tenureMonths: y * 12 });
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                  />

                  <div className="text-[11px] text-slate-500 mt-1">
                    = {inputs.tenureYears * 12} Total Months
                  </div>
                </>
              )}
            </div>

            {/* Quick Tenure Pills for Years or Months */}
            <div className="pt-1 border-t border-slate-200/60 flex justify-between gap-1">
              {inputs.tenureUnit === 'months'
                ? [60, 120, 180, 240, 300].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChange({ tenureMonths: m, tenureYears: Math.round(m / 12) })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        (inputs.tenureMonths || inputs.tenureYears * 12) === m
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m}m
                    </button>
                  ))
                : [5, 10, 15, 20, 25].map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => onChange({ tenureYears: y, tenureMonths: y * 12 })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        inputs.tenureYears === y
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {y}y
                    </button>
                  ))}
            </div>
          </div>

          {/* STEP 4: STRESS RATE */}
          <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px] font-bold">4</span>
                  Stress Rate
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  CBUAE +{st.bufferPercent}%
                </span>
              </div>

              <div className="mt-2.5">
                <div className="text-base font-extrabold text-amber-950 font-mono-numbers">
                  {st.stressedInitialRate.toFixed(2)}%
                  <span className="text-xs font-normal text-amber-700 ml-1">stressed</span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium mt-0.5 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3 text-amber-600" />
                  EMI: {formatCurrency(st.stressedMonthlyEMI)}/mo
                </p>
              </div>

              {/* Stress Buffer Selector */}
              <div className="grid grid-cols-4 gap-1 mt-2">
                {[1.5, 2.0, 2.5, 3.0].map(buf => (
                  <button
                    key={buf}
                    type="button"
                    onClick={() => onChange({ stressTestBuffer: buf })}
                    className={`py-1 rounded text-[10px] font-bold transition-all ${
                      inputs.stressTestBuffer === buf
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    +{buf}%
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 border-t border-amber-200/60 text-[10px] text-amber-900 flex justify-between font-medium">
              <span>Payment Shock:</span>
              <span>+{formatCurrency(st.monthlyDifference)}/mo</span>
            </div>
          </div>

          {/* STEP 5: ELIGIBILITY */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">5</span>
                  Eligibility
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  results.isDbrExceeded
                    ? 'bg-red-100 text-red-800'
                    : st.isStressedDbrExceeded
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {results.isDbrExceeded ? 'Over Cap' : st.isStressedDbrExceeded ? 'Stress Flagged' : 'Eligible'}
                </span>
              </div>

              {/* Monthly Income & Commitments inputs */}
              <div className="mt-2 space-y-1.5">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    Inc:
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={inputs.monthlyIncome || ''}
                    onChange={(e) => onChange({ monthlyIncome: Number(e.target.value) || 0 })}
                    placeholder="Net Income"
                    className="w-full pl-10 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    title="Monthly Net Salary (AED)"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    Debt:
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={inputs.existingDebts || ''}
                    onChange={(e) => onChange({ existingDebts: Number(e.target.value) || 0 })}
                    placeholder="Existing Debts"
                    className="w-full pl-11 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    title="Existing Monthly Debts & 5% of Card Limits (AED)"
                  />
                </div>
              </div>
            </div>

            {/* DBR Result status */}
            <div className="pt-1 border-t border-slate-200/60 text-[11px] flex justify-between font-bold">
              <span className="text-slate-600">DBR: {results.dbrRatio.toFixed(1)}%</span>
              <span className={results.isDbrExceeded ? 'text-red-700' : 'text-emerald-700'}>
                {results.isDbrExceeded ? 'Exceeds 50%' : 'Under 50% Cap'}
              </span>
            </div>
          </div>

        </div>

        {/* Collapsible Property Price & Down Payment Sub-Bar */}
        {showPropertyDetails && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-700" />
                Linked Property Price &amp; Down Payment Configuration
              </span>
              <span className="text-xs text-emerald-800">
                Central Bank Max LTV: <strong>{results.maxLtvPercent}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Property Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Purchase Price (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">AED</span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={inputs.propertyPrice === 0 ? '' : inputs.propertyPrice}
                    placeholder="0"
                    onChange={(e) => handlePriceChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full pl-12 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono-numbers"
                  />
                </div>
              </div>

              {/* Down Payment % */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Down Payment (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={inputs.downPaymentPercent === 0 ? '' : inputs.downPaymentPercent}
                    placeholder="0"
                    onChange={(e) => handlePercentChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono-numbers"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              {/* Down Payment AED */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Down Payment (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">AED</span>
                  <input
                    type="text"
                    disabled
                    value={formatNumber(inputs.downPaymentAmount)}
                    className="w-full pl-12 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 font-mono-numbers cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Validation Banner if down payment is below legal minimum */}
            {!results.isDownPaymentValid && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-100 text-amber-950 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Below UAE Central Bank minimum ({results.minDownPaymentPercent}% for {inputs.residencyStatus === 'resident' ? 'residents' : 'non-residents'}).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePercentChange(results.minDownPaymentPercent)}
                  className="font-bold underline text-amber-900 hover:text-black ml-2"
                >
                  Fix to {results.minDownPaymentPercent}%
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
