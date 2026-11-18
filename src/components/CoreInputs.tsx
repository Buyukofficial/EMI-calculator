import React from 'react';
import { MortgageInputs, CalculationResults } from '../types/mortgage';
import { UAE_BANK_PRESETS, formatNumber } from '../utils/calculations';
import { 
  Building, 
  Calendar, 
  Percent, 
  SlidersHorizontal, 
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface CoreInputsProps {
  inputs: MortgageInputs;
  results: CalculationResults;
  onChange: (updates: Partial<MortgageInputs>) => void;
  onOpenLtvHelp: () => void;
}

export const CoreInputs: React.FC<CoreInputsProps> = ({
  inputs,
  results,
  onChange,
  onOpenLtvHelp
}) => {
  // Handle Property Price Change
  const handlePriceChange = (val: number) => {
    const validPrice = Math.max(100000, Math.min(val, 100000000));
    // Recalculate down payment amount preserving percentage
    const newDownAmount = Math.round((validPrice * inputs.downPaymentPercent) / 100);
    onChange({
      propertyPrice: validPrice,
      downPaymentAmount: newDownAmount
    });
  };

  // Handle Down Payment % Change
  const handlePercentChange = (pct: number) => {
    const validPct = Math.max(5, Math.min(pct, 90));
    const newAmount = Math.round((inputs.propertyPrice * validPct) / 100);
    onChange({
      downPaymentPercent: validPct,
      downPaymentAmount: newAmount
    });
  };

  // Handle Down Payment AED Amount Change
  const handleAmountChange = (amt: number) => {
    const validAmt = Math.max(0, Math.min(amt, inputs.propertyPrice * 0.95));
    const newPct = parseFloat(((validAmt / inputs.propertyPrice) * 100).toFixed(1));
    onChange({
      downPaymentAmount: validAmt,
      downPaymentPercent: newPct
    });
  };

  // Handle Bank Preset Change
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-7 print-break-inside-avoid">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Loan &amp; Property Parameters</h2>
            <p className="text-xs text-slate-500">Live recalculation with UAE Central Bank rules</p>
          </div>
        </div>

        {/* Residency Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ residencyStatus: 'resident' })}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              inputs.residencyStatus === 'resident'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            UAE Resident / National
          </button>
          <button
            type="button"
            onClick={() => onChange({ residencyStatus: 'non_resident' })}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              inputs.residencyStatus === 'non_resident'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Non-Resident / Expat
          </button>
        </div>
      </div>

      {/* 1. Property Price Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="property-price" className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            Property Price (AED)
          </label>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Presets:</span>
            {[1000000, 2000000, 3500000, 5000000, 8000000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => handlePriceChange(amt)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  inputs.propertyPrice === amt
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
            AED
          </span>
          <input
            id="property-price"
            type="number"
            min={100000}
            max={50000000}
            step={50000}
            value={inputs.propertyPrice}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
            className="w-full pl-14 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-base sm:text-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 font-mono-numbers transition-all"
            aria-label="Property price in UAE Dirhams"
          />
        </div>

        {/* Price Slider */}
        <input
          type="range"
          min={500000}
          max={15000000}
          step={50000}
          value={inputs.propertyPrice}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          aria-label="Property price slider"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers">
          <span>AED 500,000</span>
          <span>AED 5,000,000 (Central Bank Tier)</span>
          <span>AED 15,000,000+</span>
        </div>
      </div>

      {/* 2. Down Payment (Linked % and AED Toggles) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label htmlFor="down-payment-pct" className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            Down Payment
            <button
              type="button"
              onClick={onOpenLtvHelp}
              className="text-slate-400 hover:text-emerald-700 transition-colors"
              title="View UAE Central Bank LTV rules"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </label>

          {/* Quick Percent Buttons */}
          <div className="flex items-center gap-1">
            {[15, 20, 25, 30, 40].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentChange(pct)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  inputs.downPaymentPercent === pct
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Linked Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Percentage Input */}
          <div className="relative">
            <input
              id="down-payment-pct"
              type="number"
              min={5}
              max={90}
              step={0.5}
              value={inputs.downPaymentPercent}
              onChange={(e) => handlePercentChange(Number(e.target.value))}
              className={`w-full pr-10 pl-4 py-3 bg-slate-50/70 border rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 font-mono-numbers transition-all ${
                !results.isDownPaymentValid
                  ? 'border-amber-400 focus:ring-amber-400/30 text-amber-900 bg-amber-50/40'
                  : 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-600'
              }`}
              aria-label="Down payment percentage"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              %
            </span>
          </div>

          {/* AED Amount Input */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              AED
            </span>
            <input
              id="down-payment-aed"
              type="number"
              min={0}
              max={inputs.propertyPrice}
              step={10000}
              value={inputs.downPaymentAmount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              className={`w-full pl-14 pr-4 py-3 bg-slate-50/70 border rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 font-mono-numbers transition-all ${
                !results.isDownPaymentValid
                  ? 'border-amber-400 focus:ring-amber-400/30 text-amber-900 bg-amber-50/40'
                  : 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-600'
              }`}
              aria-label="Down payment in AED"
            />
          </div>
        </div>

        {/* Down Payment Slider */}
        <input
          type="range"
          min={5}
          max={60}
          step={0.5}
          value={inputs.downPaymentPercent}
          onChange={(e) => handlePercentChange(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            !results.isDownPaymentValid ? 'bg-amber-200 accent-amber-600' : 'bg-slate-200 accent-emerald-600'
          }`}
          aria-label="Down payment percent slider"
        />

        {/* Central Bank LTV Validation Banner */}
        {!results.isDownPaymentValid ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Below UAE Central Bank Minimum Requirement ({results.minDownPaymentPercent}%)
              </p>
              <p className="mt-0.5 text-amber-800">
                For a {inputs.residencyStatus === 'resident' ? 'UAE Resident' : 'Non-Resident'} purchasing at AED {formatNumber(inputs.propertyPrice)}, 
                maximum allowed LTV is <strong>{results.maxLtvPercent}%</strong>. 
                Minimum down payment required is <strong>{formatNumber(results.minDownPaymentAmount)} AED ({results.minDownPaymentPercent}%)</strong>.
              </p>
              <button
                type="button"
                onClick={() => handlePercentChange(results.minDownPaymentPercent)}
                className="mt-1.5 font-semibold text-amber-900 underline hover:text-amber-950 inline-flex items-center gap-1"
              >
                Set to minimum {results.minDownPaymentPercent}%
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/60 px-3 py-1.5 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Complies with UAE Central Bank LTV limit (Max {results.maxLtvPercent}% LTV)</span>
            </div>
            <span className="font-mono font-medium">Loan: AED {formatNumber(results.loanAmount)}</span>
          </div>
        )}
      </div>

      {/* 3. Loan Tenure */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label htmlFor="loan-tenure" className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Loan Tenure (Years)
          </label>
          <span className="text-xs text-slate-500">
            Max 25 years for expats (UAE law)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
          <div className="sm:col-span-3">
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={inputs.tenureYears}
              onChange={(e) => onChange({ tenureYears: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              aria-label="Loan tenure slider"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers mt-1">
              <span>1 Year</span>
              <span>10 Years</span>
              <span>15 Years</span>
              <span>20 Years</span>
              <span>25 Years (Max)</span>
            </div>
          </div>

          <div className="relative">
            <input
              id="loan-tenure"
              type="number"
              min={1}
              max={25}
              step={1}
              value={inputs.tenureYears}
              onChange={(e) => onChange({ tenureYears: Math.max(1, Math.min(25, Number(e.target.value))) })}
              className="w-full pr-12 pl-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 font-mono-numbers text-center"
              aria-label="Loan tenure in years"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              Yrs
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bank Rate Presets & Interest Structure */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        
        {/* Preset Selector */}
        <div className="space-y-1.5">
          <label htmlFor="bank-preset" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            UAE Bank Market Presets
          </label>
          <select
            id="bank-preset"
            onChange={(e) => handlePresetSelect(e.target.value)}
            defaultValue="enbd_3yr"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {UAE_BANK_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.label} — {preset.description}
              </option>
            ))}
          </select>
        </div>

        {/* Interest Type: Reducing Balance vs Flat Rate */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div>
            <span className="text-xs font-bold text-slate-900">Interest Calculation Type</span>
            <p className="text-[11px] text-slate-500">
              {inputs.interestType === 'reducing'
                ? 'Standard reducing balance (interest charged on remaining principal)'
                : 'Flat rate (interest charged on original principal throughout tenure)'}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 border border-slate-200 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChange({ interestType: 'reducing' })}
              className={`px-2.5 py-1 rounded transition-all ${
                inputs.interestType === 'reducing' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reducing
            </button>
            <button
              type="button"
              onClick={() => onChange({ interestType: 'flat' })}
              className={`px-2.5 py-1 rounded transition-all ${
                inputs.interestType === 'flat' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flat Rate
            </button>
          </div>
        </div>

        {/* Rate Structure Configuration */}
        {inputs.interestType === 'reducing' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Rate Structure</span>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => onChange({ rateStructure: 'fixed_variable' })}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    inputs.rateStructure === 'fixed_variable'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Fixed + Variable Split
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ rateStructure: 'fixed_only' })}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    inputs.rateStructure === 'fixed_only'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Fixed for Full Term
                </button>
              </div>
            </div>

            {/* Inputs Grid for Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Initial Fixed Rate */}
              <div>
                <label htmlFor="initial-rate" className="block text-xs font-medium text-slate-600 mb-1">
                  Initial Rate (% p.a.)
                </label>
                <div className="relative">
                  <input
                    id="initial-rate"
                    type="number"
                    min={1}
                    max={15}
                    step={0.05}
                    value={inputs.initialRate}
                    onChange={(e) => onChange({ initialRate: Number(e.target.value) })}
                    className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono-numbers focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              {/* Fixed Period (Years) */}
              {inputs.rateStructure === 'fixed_variable' && (
                <div>
                  <label htmlFor="fixed-years" className="block text-xs font-medium text-slate-600 mb-1">
                    Fixed Period (Years)
                  </label>
                  <select
                    id="fixed-years"
                    value={inputs.fixedYears}
                    onChange={(e) => onChange({ fixedYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {[1, 2, 3, 4, 5, 7, 10].map(y => (
                      <option key={y} value={y}>
                        {y} {y === 1 ? 'Year' : 'Years'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Variable Rate */}
              {inputs.rateStructure === 'fixed_variable' && (
                <div>
                  <label htmlFor="variable-rate" className="block text-xs font-medium text-slate-600 mb-1">
                    Variable Rate (% p.a.)
                  </label>
                  <div className="relative">
                    <input
                      id="variable-rate"
                      type="number"
                      min={1}
                      max={18}
                      step={0.05}
                      value={inputs.variableRate}
                      onChange={(e) => onChange({ variableRate: Number(e.target.value) })}
                      className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono-numbers focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              )}
            </div>

            {inputs.rateStructure === 'fixed_variable' && (
              <p className="text-[11px] text-slate-500 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  After Year {inputs.fixedYears}, remaining balance is amortized at {inputs.variableRate}% (e.g. 3-Month EIBOR + bank margin).
                </span>
              </p>
            )}
          </div>
        ) : (
          /* Flat Rate Input */
          <div className="space-y-2">
            <label htmlFor="flat-rate" className="block text-xs font-medium text-slate-600">
              Flat Rate (% p.a.)
            </label>
            <div className="relative">
              <input
                id="flat-rate"
                type="number"
                min={1}
                max={10}
                step={0.05}
                value={inputs.flatRate}
                onChange={(e) => onChange({ flatRate: Number(e.target.value) })}
                className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono-numbers focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Note: A {inputs.flatRate}% flat rate is equivalent to approximately {(inputs.flatRate * 1.85).toFixed(2)}% in standard reducing balance terms.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
