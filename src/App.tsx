import React, { useState, useEffect } from 'react';
import {
  History,
  Share2,
  Menu,
  ChevronDown,
  ChevronLeft,
  Check,
  Percent,
  Sparkles,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { DonutChart } from './components/DonutChart';
import { DetailsModal } from './components/DetailsModal';
import { HistoryModal, HistoryItem } from './components/HistoryModal';
import { formatNumber } from './utils/calculations';

type SolveTarget = 'loan' | 'interest' | 'period' | 'emi';

export const App: React.FC = () => {
  // Input string states - default to UAE benchmark mortgage values
  const [loanAmount, setLoanAmount] = useState<string>('1000000');
  const [interestRate, setInterestRate] = useState<string>('6.29');
  const [period, setPeriod] = useState<string>('12');
  const [periodUnit, setPeriodUnit] = useState<'year' | 'month'>('year');
  const [emi, setEmi] = useState<string>('9909.24');
  const [processingFeePercent, setProcessingFeePercent] = useState<string>('0');

  // Calculation target (whichever radio button is checked)
  const [target, setTarget] = useState<SolveTarget>('emi');

  // Currency: Default to AED (Dirhams) per user request
  const [currency, setCurrency] = useState<string>('AED');

  // Calculated results
  const [resultEmi, setResultEmi] = useState<number>(9909);
  const [resultTotalInterest, setResultTotalInterest] = useState<number>(426931);
  const [resultProcessingFee, setResultProcessingFee] = useState<number>(0);
  const [resultTotalPayment, setResultTotalPayment] = useState<number>(1426931);
  const [loanPercent, setLoanPercent] = useState<number>(70.08);
  const [interestPercent, setInterestPercent] = useState<number>(29.92);

  // UAE Central Bank +2% Stress Test EMI calculation
  const [stressEMI, setStressEMI] = useState<number>(11284);

  // Modals & toast
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('emi_history');
      if (saved) {
        setHistoryList(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Format number with commas for display
  const formatCommaValue = (val: string) => {
    if (!val) return '';
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Safe handler for input text changes: allows blank string, avoids snap to 0
  const handleInputChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    if (raw === '') {
      setter('');
      return;
    }
    // Only accept digits and at most 1 decimal point
    if (/^\d*\.?\d*$/.test(raw)) {
      setter(raw);
    }
  };

  // Quick preset helper
  const setQuickLoan = (amount: number) => {
    setLoanAmount(amount.toString());
  };

  const setQuickPeriod = (years: number) => {
    setPeriod(years.toString());
    setPeriodUnit('year');
  };

  // Trigger calculation based on active radio target
  const performCalculation = () => {
    const P = parseFloat(loanAmount) || 0;
    const R = parseFloat(interestRate) || 0;
    const rawPeriod = parseFloat(period) || 0;
    const N = periodUnit === 'year' ? rawPeriod * 12 : rawPeriod;
    const E = parseFloat(emi) || 0;
    const feePct = parseFloat(processingFeePercent) || 0;

    let computedEMI = E;
    let computedP = P;
    let computedR = R;
    let computedN = N;

    const monthlyRate = (R / 12) / 100;

    if (target === 'emi') {
      if (P <= 0 || N <= 0) return;
      if (monthlyRate === 0) {
        computedEMI = P / N;
      } else {
        const factor = Math.pow(1 + monthlyRate, N);
        computedEMI = (P * monthlyRate * factor) / (factor - 1);
      }
      setEmi(computedEMI.toFixed(2));
    } else if (target === 'loan') {
      if (E <= 0 || N <= 0) return;
      if (monthlyRate === 0) {
        computedP = E * N;
      } else {
        const factor = Math.pow(1 + monthlyRate, N);
        computedP = (E * (factor - 1)) / (monthlyRate * factor);
      }
      computedEMI = E;
      setLoanAmount(Math.round(computedP).toString());
    } else if (target === 'period') {
      if (P <= 0 || E <= 0 || monthlyRate === 0) return;
      const numerator = Math.log(E / (E - P * monthlyRate));
      const denominator = Math.log(1 + monthlyRate);
      if (numerator > 0 && denominator > 0) {
        computedN = numerator / denominator;
        const displayPeriod = periodUnit === 'year' ? (computedN / 12).toFixed(1) : Math.round(computedN).toString();
        setPeriod(displayPeriod);
      }
      computedEMI = E;
    } else if (target === 'interest') {
      // Solve for interest rate via binary search
      if (P <= 0 || E <= 0 || N <= 0) return;
      let low = 0.00001;
      let high = 1.0;
      for (let iter = 0; iter < 40; iter++) {
        const mid = (low + high) / 2;
        const factor = Math.pow(1 + mid, N);
        const testE = (P * mid * factor) / (factor - 1);
        if (testE < E) {
          low = mid;
        } else {
          high = mid;
        }
      }
      const annualRate = ((low + high) / 2) * 12 * 100;
      computedR = annualRate;
      setInterestRate(annualRate.toFixed(2));
      computedEMI = E;
    }

    const principal = target === 'loan' ? computedP : P;
    const tenureMonths = target === 'period' ? computedN : N;
    const finalEMI = target === 'emi' ? computedEMI : (parseFloat(emi) || computedEMI);

    const totalPay = finalEMI * tenureMonths;
    const totalInt = Math.max(0, totalPay - principal);
    const feeAmount = (principal * feePct) / 100;

    const intPct = totalPay > 0 ? (totalInt / totalPay) * 100 : 0;
    const pPct = totalPay > 0 ? (principal / totalPay) * 100 : 0;

    // +2% Stress test calculation for UAE mortgage compliance
    const stressRate = (R + 2.0) / 12 / 100;
    let sEMI = 0;
    if (principal > 0 && tenureMonths > 0) {
      if (stressRate === 0) {
        sEMI = principal / tenureMonths;
      } else {
        const sFactor = Math.pow(1 + stressRate, tenureMonths);
        sEMI = (principal * stressRate * sFactor) / (sFactor - 1);
      }
    }

    setResultEmi(Math.round(finalEMI));
    setResultTotalInterest(Math.round(totalInt));
    setResultProcessingFee(Math.round(feeAmount));
    setResultTotalPayment(Math.round(totalPay));
    setLoanPercent(parseFloat(pPct.toFixed(2)));
    setInterestPercent(parseFloat(intPct.toFixed(2)));
    setStressEMI(Math.round(sEMI));

    // Save calculation to history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      loanAmount: principal.toString(),
      interest: R.toString(),
      period: rawPeriod.toString(),
      periodUnit,
      emi: finalEMI.toFixed(2),
      currency
    };

    const updatedHistory = [newItem, ...historyList.slice(0, 19)];
    setHistoryList(updatedHistory);
    try {
      localStorage.setItem('emi_history', JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }
  };

  // Reset to initial clean UAE values
  const handleReset = () => {
    setLoanAmount('1000000');
    setInterestRate('6.29');
    setPeriod('12');
    setPeriodUnit('year');
    setEmi('9909.24');
    setProcessingFeePercent('0');
    setTarget('emi');
    setResultEmi(9909);
    setResultTotalInterest(426931);
    setResultProcessingFee(0);
    setResultTotalPayment(1426931);
    setLoanPercent(70.08);
    setInterestPercent(29.92);
    setStressEMI(11284);
  };

  // Share calculation summary
  const handleShare = async () => {
    const text = `UAE Mortgage EMI Calculation:\n• Monthly EMI: ${currency} ${formatNumber(resultEmi)}\n• Total Interest: ${currency} ${formatNumber(resultTotalInterest)}\n• Processing Fee: ${currency} ${formatNumber(resultProcessingFee)}\n• Total Payment: ${currency} ${formatNumber(resultTotalPayment)}\n• +2% Stress Test EMI: ${currency} ${formatNumber(stressEMI)}\n(UAE Mortgage EMI Calculator)`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UAE EMI Calculator Result',
          text
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setToastMessage('Summary copied to clipboard!');
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      setToastMessage('Could not copy to clipboard.');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // Handle restoring item from history
  const handleRestoreHistory = (item: HistoryItem) => {
    setLoanAmount(item.loanAmount);
    setInterestRate(item.interest);
    setPeriod(item.period);
    setPeriodUnit(item.periodUnit);
    setEmi(item.emi);
    setCurrency(item.currency || 'AED');
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    try {
      localStorage.removeItem('emi_history');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] sm:py-8 flex flex-col items-center justify-start text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-4 py-2.5 bg-slate-900/90 text-white text-xs font-semibold rounded-full shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Wrapper Container - authentic iOS mobile card frame */}
      <div className="w-full max-w-[430px] bg-[#F2F2F7] sm:rounded-[44px] sm:shadow-2xl sm:border sm:border-slate-300/60 overflow-hidden flex flex-col min-h-screen sm:min-h-[900px]">
        
        {/* iOS Top Navigation Bar */}
        <header className="px-5 pt-4 pb-3 flex items-center justify-between bg-transparent">
          {/* Back / Reset Icon */}
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 active:scale-95 transition-all"
            title="Reset to defaults"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Title with UAE Flag Tag */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[17px] font-semibold text-slate-900 tracking-tight">EMI Calculator</h1>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300/50">
                UAE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Dirhams (AED)</span>
          </div>

          {/* Right Header Controls: Currency Selector & History */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-white/80 p-0.5 rounded-full border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrency('AED')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
                  currency === 'AED'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AED
              </button>
              <button
                type="button"
                onClick={() => setCurrency('$')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
                  currency === '$'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                $
              </button>
            </div>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50/80 active:scale-95 transition-all"
              title="Calculation History"
            >
              <History className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 px-4 pb-24 space-y-4">
          
          {/* Calculator Inputs Card */}
          <div className="bg-white rounded-3xl p-4 shadow-2xs border border-slate-200/60 space-y-3">
            
            {/* Row 1: Loan Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTarget('loan')}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all focus:outline-hidden"
                  title="Calculate Loan Amount from EMI"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    target === 'loan' ? 'border-blue-600' : 'border-slate-300'
                  }`}>
                    {target === 'loan' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                </button>

                <label className="text-[15px] font-normal text-slate-700 w-28 shrink-0">
                  Loan Amount
                </label>

                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatCommaValue(loanAmount)}
                    onChange={handleInputChange(setLoanAmount)}
                    placeholder="0"
                    className="w-full h-11 pl-3.5 pr-14 bg-[#EEF2F6] text-slate-900 text-[15px] font-semibold rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all text-left"
                  />
                  <span className="absolute right-3 px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 text-[11px] font-bold pointer-events-none">
                    {currency}
                  </span>
                </div>
              </div>

              {/* Quick Loan Amount Preset Pills */}
              <div className="flex items-center gap-1.5 pl-9 overflow-x-auto no-scrollbar py-0.5">
                {[500000, 1000000, 1500000, 2000000, 3000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuickLoan(amt)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all shrink-0 ${
                      loanAmount === amt.toString()
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Interest Rate */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTarget('interest')}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all focus:outline-hidden"
                title="Calculate Interest Rate from EMI"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  target === 'interest' ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {target === 'interest' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                </div>
              </button>

              <label className="text-[15px] font-normal text-slate-700 w-28 shrink-0">
                Interest
              </label>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={interestRate}
                  onChange={handleInputChange(setInterestRate)}
                  placeholder="0"
                  className="w-full h-11 pl-3.5 pr-10 bg-[#EEF2F6] text-slate-900 text-[15px] font-semibold rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all text-left"
                />
                <span className="absolute right-3 px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 text-[11px] font-bold pointer-events-none">
                  %
                </span>
              </div>
            </div>

            {/* Row 3: Period */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTarget('period')}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all focus:outline-hidden"
                  title="Calculate Period from EMI"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    target === 'period' ? 'border-blue-600' : 'border-slate-300'
                  }`}>
                    {target === 'period' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                </button>

                <label className="text-[15px] font-normal text-slate-700 w-28 shrink-0">
                  Period
                </label>

                <div className="flex-1 flex items-center bg-[#EEF2F6] rounded-xl h-11 px-3.5 gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={period}
                    onChange={handleInputChange(setPeriod)}
                    placeholder="0"
                    className="flex-1 bg-transparent text-slate-900 text-[15px] font-semibold outline-hidden text-left"
                  />

                  {/* Period Unit Selector (Year / Month) */}
                  <div className="relative shrink-0">
                    <select
                      value={periodUnit}
                      onChange={(e) => setPeriodUnit(e.target.value as 'year' | 'month')}
                      className="appearance-none bg-white/70 hover:bg-white pl-2 pr-6 py-1 rounded-md border border-slate-200 text-slate-700 text-[12px] font-bold cursor-pointer outline-hidden transition-colors"
                    >
                      <option value="year">Year</option>
                      <option value="month">Month</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Quick Period Preset Pills */}
              <div className="flex items-center gap-1.5 pl-9 overflow-x-auto no-scrollbar py-0.5">
                {[5, 10, 15, 20, 25].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setQuickPeriod(yr)}
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all shrink-0 ${
                      period === yr.toString() && periodUnit === 'year'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: EMI */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTarget('emi')}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all focus:outline-hidden"
                title="Calculate EMI from Loan, Interest & Period"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  target === 'emi' ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {target === 'emi' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                </div>
              </button>

              <label className="text-[15px] font-normal text-slate-700 w-28 shrink-0">
                EMI
              </label>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={target === 'emi' ? (emi ? formatCommaValue(emi) : '') : formatCommaValue(emi)}
                  onChange={handleInputChange(setEmi)}
                  placeholder={target === 'emi' ? 'Auto-calculated' : '0'}
                  className={`w-full h-11 pl-3.5 pr-14 bg-[#EEF2F6] text-slate-900 text-[15px] font-semibold rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all text-left ${
                    target === 'emi' ? 'text-blue-600' : ''
                  }`}
                />
                <span className="absolute right-3 px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 text-[11px] font-bold pointer-events-none">
                  {currency}
                </span>
              </div>
            </div>

            {/* Row 5: Processing Fee (No radio button) */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 shrink-0" />

              <label className="text-[15px] font-normal text-slate-700 w-28 shrink-0">
                Processing Fee
              </label>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={processingFeePercent}
                  onChange={handleInputChange(setProcessingFeePercent)}
                  placeholder="0"
                  className="w-full h-11 pl-3.5 pr-10 bg-[#EEF2F6] text-slate-900 text-[15px] font-semibold rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all text-left"
                />
                <span className="absolute right-3 px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 text-[11px] font-bold pointer-events-none">
                  %
                </span>
              </div>
            </div>

          </div>

          {/* Action Buttons: Reset & Calculate */}
          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <button
              type="button"
              onClick={handleReset}
              className="w-full h-12 rounded-full bg-[#E5E9F0] hover:bg-slate-200 text-slate-700 font-semibold text-[15px] transition-all flex items-center justify-center active:scale-[0.98]"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={performCalculation}
              className="w-full h-12 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white font-semibold text-[15px] transition-all shadow-md shadow-blue-500/25 flex items-center justify-center active:scale-[0.98]"
            >
              Calculate
            </button>
          </div>

          {/* Calculation Results Card */}
          <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200/60 divide-y divide-slate-100">
            {/* Monthly EMI */}
            <div className="flex items-center justify-between py-2.5 first:pt-0">
              <span className="text-[14px] text-slate-500 font-medium">Monthly EMI</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-bold text-slate-400">{currency}</span>
                <span className="text-[18px] font-bold text-blue-600 tracking-tight">
                  {formatNumber(resultEmi)}
                </span>
              </div>
            </div>

            {/* Total Interest */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[14px] text-slate-500 font-medium">Total Interest</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-bold text-slate-400">{currency}</span>
                <span className="text-[16px] font-bold text-slate-800 tracking-tight">
                  {formatNumber(resultTotalInterest)}
                </span>
              </div>
            </div>

            {/* Processing Fee */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[14px] text-slate-500 font-medium">Processing Fee</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-bold text-slate-400">{currency}</span>
                <span className="text-[16px] font-bold text-slate-800 tracking-tight">
                  {formatNumber(resultProcessingFee)}
                </span>
              </div>
            </div>

            {/* Total Payment */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[14px] text-slate-500 font-medium">Total Payment</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-bold text-slate-400">{currency}</span>
                <span className="text-[16px] font-bold text-slate-800 tracking-tight">
                  {formatNumber(resultTotalPayment)}
                </span>
              </div>
            </div>

            {/* UAE Central Bank Stress Test Banner */}
            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[12px] font-semibold text-slate-600">
                  +2% UAE Stress Test EMI
                </span>
              </div>
              <div className="flex items-baseline gap-1 text-emerald-700">
                <span className="text-[11px] font-bold">{currency}</span>
                <span className="text-[14px] font-bold tracking-tight">
                  {formatNumber(stressEMI)}
                </span>
              </div>
            </div>
          </div>

          {/* Donut Chart Visual Card */}
          <DonutChart
            loanPercent={loanPercent}
            interestPercent={interestPercent}
          />

          {/* UAE Central Bank Regulatory Footer Tag */}
          <div className="text-center px-4 py-1">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              🇦🇪 UAE Central Bank LTV compliant (up to 85% for citizens, 80% for expats). Max tenure 25 years.
            </p>
          </div>

        </div>

        {/* Bottom Floating/Sticky Action Bar (Share & Details) */}
        <div className="fixed bottom-0 left-0 right-0 sm:static bg-white/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-t-0 border-slate-200/60 p-4 z-40 max-w-[430px] mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="h-12 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-[15px] flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <Share2 className="w-4 h-4 stroke-[2.2]" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="h-12 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-[15px] flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <Menu className="w-4 h-4 stroke-[2.2]" />
              <span>Details</span>
            </button>
          </div>
        </div>

      </div>

      {/* Slide-over / Modal for Details (Schedule, UAE stress test & fees) */}
      <DetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        currency={currency}
        loanAmount={parseFloat(loanAmount) || 0}
        interestRate={parseFloat(interestRate) || 0}
        tenureYears={periodUnit === 'year' ? (parseFloat(period) || 0) : ((parseFloat(period) || 0) / 12)}
        monthlyEMI={resultEmi}
        totalInterest={resultTotalInterest}
        totalPayment={resultTotalPayment}
        processingFeeAmount={resultProcessingFee}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyList}
        onSelect={handleRestoreHistory}
        onClear={handleClearHistory}
      />

    </div>
  );
};

export default App;
