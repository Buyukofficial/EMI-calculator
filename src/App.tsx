import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Share2,
  RotateCcw,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  Percent,
  Check,
  HelpCircle,
  FileSpreadsheet,
  TableProperties,
  Receipt,
  Calculator,
  ChevronDown,
  Landmark
} from 'lucide-react';
import { DonutChart } from './components/DonutChart';
import { HistoryModal, HistoryItem } from './components/HistoryModal';
import { formatNumber, exportAmortizationToCSV } from './utils/calculations';
import { AmortizationRow, YearlyAmortizationRow } from './types/mortgage';
import { FLATTENED_LOANZONE_RATES, LOANZONE_BANK_DATA, DropdownRateOption } from './data/uaeBankRates';

type SolveTarget = 'loan' | 'interest' | 'period' | 'emi';

export const App: React.FC = () => {
  // Input string states - default to benchmark values
  const [loanAmount, setLoanAmount] = useState<string>('1000000');
  const [interestRate, setInterestRate] = useState<string>('6.29');
  const [selectedBankKey, setSelectedBankKey] = useState<string>('');
  const [period, setPeriod] = useState<string>('12');
  const [periodUnit, setPeriodUnit] = useState<'year' | 'month'>('year');
  const [emi, setEmi] = useState<string>('9909.24');
  const [processingFeePercent, setProcessingFeePercent] = useState<string>('0');

  // Calculation target (whichever radio button is checked)
  const [target, setTarget] = useState<SolveTarget>('emi');

  // Currency: Default to AED (Dirhams)
  const [currency, setCurrency] = useState<string>('AED');

  // Calculated results
  const [resultEmi, setResultEmi] = useState<number>(9909);
  const [resultTotalInterest, setResultTotalInterest] = useState<number>(426931);
  const [resultProcessingFee, setResultProcessingFee] = useState<number>(0);
  const [resultTotalPayment, setResultTotalPayment] = useState<number>(1426931);
  const [loanPercent, setLoanPercent] = useState<number>(70.08);
  const [interestPercent, setInterestPercent] = useState<number>(29.92);

  // UAE Stress test (+2% rate buffer)
  const [stressEMI, setStressEMI] = useState<number>(11284);

  // Dashboard detail view states: schedule, fees, or live bank rates
  const [detailsTab, setDetailsTab] = useState<'schedule' | 'fees' | 'rates'>('schedule');
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');

  // Selected bank details (if chosen from dropdown)
  const selectedBankInfo = useMemo<DropdownRateOption | null>(() => {
    if (!selectedBankKey) return null;
    for (const group of FLATTENED_LOANZONE_RATES) {
      const found = group.options.find((opt) => opt.key === selectedBankKey);
      if (found) return found;
    }
    return null;
  }, [selectedBankKey]);

  // History & Toast
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

  // Trigger calculation based on active radio target
  const performCalculation = (overrideRate?: number | unknown) => {
    const P = parseFloat(loanAmount) || 0;
    const R = typeof overrideRate === 'number' ? overrideRate : (parseFloat(interestRate) || 0);
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

  // Handle Bank benchmark rate selection from dropdown
  const handleBankRateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setSelectedBankKey(key);
    if (!key) return;

    for (const group of FLATTENED_LOANZONE_RATES) {
      const found = group.options.find((opt) => opt.key === key);
      if (found) {
        setInterestRate(found.rate.toString());
        performCalculation(found.rate);
        break;
      }
    }
  };

  // Reset to initial clean benchmark values
  const handleReset = () => {
    setLoanAmount('1000000');
    setInterestRate('6.29');
    setSelectedBankKey('');
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
    const text = `UAE Mortgage EMI Calculation:\n• Monthly EMI: ${currency} ${formatNumber(resultEmi)}\n• Total Interest: ${currency} ${formatNumber(resultTotalInterest)}\n• Processing Fee: ${currency} ${formatNumber(resultProcessingFee)}\n• Total Payment: ${currency} ${formatNumber(resultTotalPayment)}\n• +2% Stress Test EMI: ${currency} ${formatNumber(stressEMI)}\n(Calculated with UAE Mortgage EMI Calculator)`;
    
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

  // Build schedules for the amortization table on the dashboard
  const P = parseFloat(loanAmount) || 0;
  const R = parseFloat(interestRate) || 0;
  const tenureYears = periodUnit === 'year' ? (parseFloat(period) || 0) : ((parseFloat(period) || 0) / 12);
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));
  const monthlyRate = (R / 12) / 100;

  const monthlySchedule = useMemo(() => {
    const rows: AmortizationRow[] = [];
    let balance = P;
    let accInt = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const intPart = balance * monthlyRate;
      let princPart = resultEmi - intPart;

      if (m === totalMonths || princPart > balance) {
        princPart = balance;
        balance = 0;
      } else {
        balance = Math.max(0, balance - princPart);
      }

      accInt += intPart;

      rows.push({
        month: m,
        year: Math.ceil(m / 12),
        payment: resultEmi,
        principal: princPart,
        interest: intPart,
        remainingBalance: balance,
        rateApplied: R
      });
    }
    return rows;
  }, [P, R, totalMonths, monthlyRate, resultEmi]);

  const yearlySchedule = useMemo(() => {
    const map = new Map<number, YearlyAmortizationRow>();
    for (const row of monthlySchedule) {
      if (!map.has(row.year)) {
        map.set(row.year, {
          year: row.year,
          totalPayment: 0,
          totalPrincipal: 0,
          totalInterest: 0,
          endingBalance: row.remainingBalance,
          effectiveRate: row.rateApplied
        });
      }
      const yr = map.get(row.year)!;
      yr.totalPayment += row.payment;
      yr.totalPrincipal += row.principal;
      yr.totalInterest += row.interest;
      yr.endingBalance = row.remainingBalance;
    }
    return Array.from(map.values());
  }, [monthlySchedule]);

  const handleExportCSV = () => {
    exportAmortizationToCSV(
      scheduleView === 'monthly' ? monthlySchedule : yearlySchedule,
      scheduleView,
      P > 0 ? P * 1.25 : 2000000,
      P
    );
  };

  // Estimated UAE Property Acquisition Fees
  const estimatedPropertyPrice = P > 0 ? Math.round(P / 0.8) : 0;
  const dldFee = estimatedPropertyPrice * 0.04;
  const agencyCommission = estimatedPropertyPrice * 0.02 * 1.05;
  const bankFee = P > 0 ? Math.max(10000, P * 0.01) * 1.05 : 0;
  const valuation = P > 0 ? 3150 : 0;
  const mortgageReg = P > 0 ? (P * 0.0025) + 290 : 0;
  const trusteeFee = estimatedPropertyPrice >= 500000 ? 4200 : 2100;
  const totalFees = dldFee + agencyCommission + bankFee + valuation + mortgageReg + trusteeFee;

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 antialiased font-sans selection:bg-blue-100 selection:text-blue-900 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-slate-900/90 text-white text-xs font-semibold rounded-full shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Dashboard Header Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2">
          
          {/* Logo & Dashboard Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm shadow-blue-500/20 shrink-0">
              AED
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  <span className="sm:hidden">LoanZone EMI</span>
                  <span className="hidden sm:inline">LoanZone Mortgage EMI Calculator</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                  ⚡ LoanZone
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                  🇦🇪 Central Bank Compliant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Comprehensive mortgage dashboard with LoanZone live bank rates &amp; +2% stress test
              </p>
            </div>
          </div>

          {/* Header Controls: Currency, History & Share */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Currency Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => setCurrency('AED')}
                className={`text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-md transition-all ${
                  currency === 'AED'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                AED
              </button>
              <button
                type="button"
                onClick={() => setCurrency('$')}
                className={`text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-md transition-all ${
                  currency === '$'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                $
              </button>
            </div>

            {/* History Modal Trigger */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Calculation History"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 stroke-[2]" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* Share / Copy Action */}
            <button
              onClick={handleShare}
              className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden xs:inline">Share</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 sm:pb-8 space-y-4 sm:space-y-6">

        {/* =========================================================================
            SECTION 1: LOAN PARAMETERS (PRIORITIZED AT TOP - BEFORE ALL OUTPUTS)
            ========================================================================= */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 sm:space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  Loan Parameters
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
                  Select any circular option to solve for that field
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] sm:text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 font-semibold transition-colors shrink-0"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Form Inputs Container (Centered on desktop, clean rows matching iOS reference) */}
          <div className="max-w-2xl mx-auto space-y-3">
            
            {/* Row 1: Loan Amount */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setTarget('loan')}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-all focus:outline-hidden"
                title="Calculate Loan Amount from EMI"
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  target === 'loan' ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {target === 'loan' && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600" />}
                </div>
              </button>

              <label className="text-xs sm:text-sm font-semibold text-slate-700 w-24 sm:w-32 shrink-0">
                Loan Amount
              </label>

              <div className="flex-1 relative flex items-center min-w-0">
                <input
                  type="text"
                  inputMode="decimal"
                  value={formatCommaValue(loanAmount)}
                  onChange={handleInputChange(setLoanAmount)}
                  placeholder="0"
                  className="w-full h-10 sm:h-11 pl-3 pr-12 sm:pr-14 bg-[#EEF2F6] text-slate-900 text-sm font-bold rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all text-left"
                />
                <span className="absolute right-3 sm:right-3.5 text-xs font-bold text-slate-500 pointer-events-none">
                  {currency}
                </span>
              </div>
            </div>

            {/* Row 2: Interest with UAE Bank Benchmark Rates Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setTarget('interest')}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-all focus:outline-hidden"
                  title="Calculate Interest Rate from EMI"
                >
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    target === 'interest' ? 'border-blue-600' : 'border-slate-300'
                  }`}>
                    {target === 'interest' && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600" />}
                  </div>
                </button>

                <label className="text-xs sm:text-sm font-semibold text-slate-700 w-24 sm:w-32 shrink-0">
                  Interest
                </label>

                <div className="flex-1 relative flex items-center min-w-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={interestRate}
                    onChange={(e) => {
                      setSelectedBankKey('');
                      handleInputChange(setInterestRate)(e);
                    }}
                    placeholder="0"
                    className="w-full h-10 sm:h-11 pl-3 pr-8 bg-[#EEF2F6] text-slate-900 text-sm font-bold rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all text-left"
                  />
                  <span className="absolute right-3 sm:right-3.5 text-xs font-bold text-slate-500 pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* UAE Bank Benchmark Rates Dropdown - Powered by LoanZone */}
              <div className="flex items-start gap-2 sm:gap-3 pl-7 sm:pl-9">
                <div className="w-24 sm:w-32 hidden sm:block shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="relative">
                    <select
                      value={selectedBankKey}
                      onChange={handleBankRateSelect}
                      style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                      className="w-full h-9 pl-7 pr-7 bg-blue-50/70 hover:bg-blue-50 text-blue-900 text-xs font-bold rounded-xl border border-blue-200/80 outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors truncate"
                    >
                      <option value="">🏦 Select UAE Bank Rate — LoanZone</option>
                      {FLATTENED_LOANZONE_RATES.map((group) => (
                        <optgroup key={group.group} label={group.group} className="text-slate-900 font-bold bg-white">
                          {group.options.map((opt) => (
                            <option key={opt.key} value={opt.key} className="text-slate-700 font-medium">
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <Building2 className="w-3.5 h-3.5 text-blue-600 absolute left-2 top-2.5 pointer-events-none" />
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* Selected Bank Details / Requirements & Variable Follow-on */}
                  {selectedBankInfo && (
                    <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-950 space-y-1 animate-in fade-in">
                      <div className="flex items-center justify-between font-bold text-blue-900">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black tracking-wide uppercase">
                            LoanZone
                          </span>
                          <span>{selectedBankInfo.label}</span>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                          {selectedBankInfo.category}
                        </span>
                      </div>
                      {selectedBankInfo.variableFollowOn && (
                        <p className="text-slate-600 text-[10px] leading-relaxed">
                          <strong className="text-slate-800">Variable Follow-on:</strong> {selectedBankInfo.variableFollowOn}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Period with Clean Segmented Year / Month Switch */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setTarget('period')}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-all focus:outline-hidden"
                title="Calculate Period from EMI"
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  target === 'period' ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {target === 'period' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                </div>
              </button>

              <label className="text-xs sm:text-sm font-semibold text-slate-700 w-24 sm:w-32 shrink-0">
                Period
              </label>

              <div className="flex-1 flex items-center bg-[#EEF2F6] rounded-xl h-10 sm:h-11 px-2.5 sm:px-3 gap-1.5 sm:gap-2 min-w-0">
                <input
                  type="text"
                  inputMode="decimal"
                  value={period}
                  onChange={handleInputChange(setPeriod)}
                  placeholder="0"
                  className="min-w-0 w-12 flex-1 bg-transparent text-slate-900 text-sm font-bold outline-hidden text-left"
                />

                {/* Clean Segmented Button Toggle */}
                <div className="flex bg-slate-200/90 p-0.5 rounded-lg shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => setPeriodUnit('year')}
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 font-bold rounded-md transition-all ${
                      periodUnit === 'year'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="sm:hidden">Yr</span>
                    <span className="hidden sm:inline">Years</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodUnit('month')}
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 font-bold rounded-md transition-all ${
                      periodUnit === 'month'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="sm:hidden">Mo</span>
                    <span className="hidden sm:inline">Months</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 4: Monthly EMI */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setTarget('emi')}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-all focus:outline-hidden"
                title="Calculate EMI from Loan, Interest & Period"
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  target === 'emi' ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {target === 'emi' && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600" />}
                </div>
              </button>

              <label className="text-xs sm:text-sm font-semibold text-slate-700 w-24 sm:w-32 shrink-0">
                Monthly EMI
              </label>

              <div className="flex-1 relative flex items-center min-w-0">
                <input
                  type="text"
                  inputMode="decimal"
                  value={target === 'emi' ? (emi ? formatCommaValue(emi) : '') : formatCommaValue(emi)}
                  onChange={handleInputChange(setEmi)}
                  placeholder={target === 'emi' ? 'Auto-calculated' : '0'}
                  className={`w-full h-10 sm:h-11 pl-3 pr-12 sm:pr-14 bg-[#EEF2F6] text-slate-900 text-sm font-bold rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all text-left ${
                    target === 'emi' ? 'text-blue-600' : ''
                  }`}
                />
                <span className="absolute right-3 sm:right-3.5 text-xs font-bold text-slate-500 pointer-events-none">
                  {currency}
                </span>
              </div>
            </div>

            {/* Row 5: Processing Fee */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />

              <label className="text-xs sm:text-sm font-semibold text-slate-700 w-24 sm:w-32 shrink-0">
                Processing Fee
              </label>

              <div className="flex-1 relative flex items-center min-w-0">
                <input
                  type="text"
                  inputMode="decimal"
                  value={processingFeePercent}
                  onChange={handleInputChange(setProcessingFeePercent)}
                  placeholder="0"
                  className="w-full h-10 sm:h-11 pl-3 pr-8 bg-[#EEF2F6] text-slate-900 text-sm font-bold rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all text-left"
                />
                <span className="absolute right-3 sm:right-3.5 text-xs font-bold text-slate-500 pointer-events-none">
                  %
                </span>
              </div>
            </div>

            {/* Action Buttons: Reset & Calculate */}
            <div className="pt-2 grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full h-11 sm:h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center active:scale-[0.98]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={performCalculation}
                className="w-full h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center active:scale-[0.98]"
              >
                Calculate
              </button>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 2: CALCULATION RESULTS (KPI METRIC CARDS - DIRECTLY AFTER PARAMETERS)
            ========================================================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* Monthly EMI Card */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/70 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Monthly EMI</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">{currency}</span>
                <span className="text-lg sm:text-2xl font-extrabold text-blue-600 tracking-tight font-mono-numbers">
                  {formatNumber(resultEmi)}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">Standard reducing</p>
            </div>
          </div>

          {/* Total Interest Card */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Interest</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">{currency}</span>
                <span className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono-numbers">
                  {formatNumber(resultTotalInterest)}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-0.5 sm:mt-1 truncate">
                {interestPercent}% of payment
              </p>
            </div>
          </div>

          {/* Total Payment Card */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/70 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Payment</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">{currency}</span>
                <span className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono-numbers">
                  {formatNumber(resultTotalPayment)}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">Principal + Interest</p>
            </div>
          </div>

          {/* +2% UAE Stress Rate EMI Card */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-700 mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">+2% Stress EMI</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] sm:text-xs font-bold text-emerald-600">{currency}</span>
                <span className="text-lg sm:text-2xl font-extrabold text-emerald-700 tracking-tight font-mono-numbers">
                  {formatNumber(stressEMI)}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 sm:mt-1 truncate">
                Central Bank Buffer ({(R + 2).toFixed(2)}%)
              </p>
            </div>
          </div>

        </section>

        {/* =========================================================================
            SECTION 3: VISUAL BREAKDOWN & UAE GUIDELINES
            ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Donut Chart Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Principal vs. Interest Breakdown</h2>
                <p className="text-xs text-slate-500">Proportional split of your total mortgage payments</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Total: {currency} {formatNumber(resultTotalPayment)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Visual Chart */}
              <div className="flex justify-center">
                <DonutChart
                  loanPercent={loanPercent}
                  interestPercent={interestPercent}
                />
              </div>

              {/* Key Financial Insights */}
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                    <span>Loan Principal</span>
                    <span>{loanPercent}%</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {currency} {formatNumber(P)}
                  </p>
                  <p className="text-[11px] text-amber-700/80 mt-0.5">Direct debt repayment</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>Total Bank Interest</span>
                    <span>{interestPercent}%</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {currency} {formatNumber(resultTotalInterest)}
                  </p>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5">Cost of borrowing over {period} {periodUnit}s</p>
                </div>

                {resultProcessingFee > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Processing Fee</span>
                      <span>{processingFeePercent}%</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {currency} {formatNumber(resultProcessingFee)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* UAE Central Bank Regulations Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>UAE Central Bank Mortgage Rules</span>
              </div>

              <ul className="text-xs text-slate-600 space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 font-bold">Maximum LTV (≤ 5M AED):</strong> 85% for UAE nationals (15% down payment), 80% for expatriates (20% down payment).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 font-bold">Maximum LTV (&gt; 5M AED):</strong> 75% for UAE nationals, 70% for expatriates.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 font-bold">Tenure Cap:</strong> Maximum 25 years (or up to retirement age 65 for salaried expats).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 font-bold">Debt Burden Ratio (DBR):</strong> Total monthly debt installments must not exceed 50% of your gross monthly income.
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              💡 <em>Indicative bank calculation. Actual mortgage rates, margins, and processing costs vary based on individual bank appraisal.</em>
            </div>
          </div>

        </section>

        {/* =========================================================================
            SECTION 4: AMORTIZATION SCHEDULE & UAE UPFRONT FEES
            ========================================================================= */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-2xs overflow-hidden">
          
          {/* Section Navigation Tabs & Export Control */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/60">
            
            {/* Tabs */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDetailsTab('schedule')}
                className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  detailsTab === 'schedule'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span className="sm:hidden">Schedule</span>
                <span className="hidden sm:inline">Amortization Schedule</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailsTab('fees')}
                className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  detailsTab === 'fees'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="sm:hidden">Upfront Fees</span>
                <span className="hidden sm:inline">UAE Upfront Fees &amp; Costs</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailsTab('rates')}
                className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  detailsTab === 'rates'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span className="sm:hidden">Bank Rates</span>
                <span className="hidden sm:inline">UAE Bank Rates</span>
              </button>
            </div>

            {/* View toggles & Export (only active on Schedule tab) */}
            {detailsTab === 'schedule' && (
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setScheduleView('yearly')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      scheduleView === 'yearly'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleView('monthly')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      scheduleView === 'monthly'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
                  title="Export Amortization Table to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
                  <span>Export CSV</span>
                </button>
              </div>
            )}

          </div>

          {/* Tab 1: Amortization Table */}
          {detailsTab === 'schedule' && (
            <div className="overflow-x-auto max-h-[440px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 sticky top-0 z-10 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{scheduleView === 'yearly' ? 'Year' : 'Month'}</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Principal</th>
                    <th className="py-3 px-4">Interest</th>
                    <th className="py-3 px-4 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-numbers text-slate-700">
                  {scheduleView === 'yearly' ? (
                    yearlySchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900">Year {row.year}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{currency} {formatNumber(Math.round(row.totalPayment))}</td>
                        <td className="py-2.5 px-4 text-blue-600 font-semibold">{currency} {formatNumber(Math.round(row.totalPrincipal))}</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-semibold">{currency} {formatNumber(Math.round(row.totalInterest))}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900">{currency} {formatNumber(Math.round(row.endingBalance))}</td>
                      </tr>
                    ))
                  ) : (
                    monthlySchedule.map((row) => (
                      <tr key={row.month} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2 px-4 font-bold text-slate-900">M{row.month} (Yr {row.year})</td>
                        <td className="py-2 px-4 font-semibold text-slate-800">{currency} {formatNumber(Math.round(row.payment))}</td>
                        <td className="py-2 px-4 text-blue-600 font-semibold">{currency} {formatNumber(Math.round(row.principal))}</td>
                        <td className="py-2 px-4 text-emerald-600 font-semibold">{currency} {formatNumber(Math.round(row.interest))}</td>
                        <td className="py-2 px-4 text-right font-bold text-slate-900">{currency} {formatNumber(Math.round(row.remainingBalance))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: UAE Upfront Acquisition Fees Breakdown */}
          {detailsTab === 'fees' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Estimated UAE Property Acquisition Costs</h3>
                <p className="text-xs text-slate-500">Based on standard Dubai Land Department (DLD) and bank regulations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="text-xs font-semibold text-slate-500">DLD Transfer Fee (4%)</div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">{currency} {formatNumber(Math.round(dldFee))}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">4% of property price + AED 580 admin</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="text-xs font-semibold text-slate-500">Agency Commission (2% + VAT)</div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">{currency} {formatNumber(Math.round(agencyCommission))}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Standard 2% brokerage + 5% VAT</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="text-xs font-semibold text-slate-500">Mortgage Registration (0.25%)</div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">{currency} {formatNumber(Math.round(mortgageReg))}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">0.25% of loan amount + AED 290</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="text-xs font-semibold text-slate-500">Bank Arrangement Fee (1%)</div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">{currency} {formatNumber(Math.round(bankFee))}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">~1% of loan amount (min AED 10,000)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="text-xs font-semibold text-slate-500">Property Valuation Fee</div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">{currency} {formatNumber(valuation)}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Standard bank inspection appraisal</div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70">
                  <div className="text-xs font-bold text-blue-800">Total Upfront Fees Needed</div>
                  <div className="text-lg font-black text-blue-600 mt-1">{currency} {formatNumber(Math.round(totalFees))}</div>
                  <div className="text-[11px] text-blue-700/80 mt-0.5">Excludes property down payment</div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 3: UAE Bank Mortgage Rates Comparison - Powered by LoanZone */}
          {detailsTab === 'rates' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">LoanZone UAE Mortgage Benchmark Rates</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                      ⚡ 14 UAE Banks
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any fixed rate pill below to automatically load it into your calculator. Includes follow-on variable spreads.
                  </p>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold self-start sm:self-auto shrink-0">
                  Central Bank Buffer: +2% to +4%
                </span>
              </div>

              {/* Responsive Bank Table */}
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 sticky top-0 z-10 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 sm:px-4">Bank</th>
                      <th className="py-3 px-3 sm:px-4">Salaried (STL Fixed)</th>
                      <th className="py-3 px-3 sm:px-4">Salaried (Non-STL Fixed)</th>
                      <th className="py-3 px-3 sm:px-4">Self-Employed (SE Fixed)</th>
                      <th className="py-3 px-3 sm:px-4 min-w-[220px]">Variable Follow-on &amp; Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {LOANZONE_BANK_DATA.map((b) => (
                      <tr key={b.bankCode} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-bold text-slate-900 whitespace-nowrap align-top">
                          <div className="text-sm text-slate-900">{b.bankName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{b.bankCode}</div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {b.stlFixedOptions.map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedBankKey(`${b.bankCode}_STL_${idx}`);
                                  setInterestRate(opt.rate.toString());
                                  performCalculation(opt.rate);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold transition-all text-[11px] shadow-2xs border border-blue-200/60"
                                title={`Apply ${opt.tenure} at ${opt.display}`}
                              >
                                <span>{opt.display}</span>
                                <span className="text-[9px] opacity-75">({opt.tenure})</span>
                              </button>
                            ))}
                          </div>
                          {b.stlVariable && (
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">
                              Var: {b.stlVariable}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {b.nonStlFixedOptions.map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedBankKey(`${b.bankCode}_NSTL_${idx}`);
                                  setInterestRate(opt.rate.toString());
                                  performCalculation(opt.rate);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white font-bold transition-all text-[11px] shadow-2xs border border-slate-200"
                                title={`Apply ${opt.tenure} at ${opt.display}`}
                              >
                                <span>{opt.display}</span>
                                <span className="text-[9px] opacity-75">({opt.tenure})</span>
                              </button>
                            ))}
                          </div>
                          {b.nonStlVariable && (
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">
                              Var: {b.nonStlVariable}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {b.selfEmployedFixedOptions.map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedBankKey(`${b.bankCode}_SE_${idx}`);
                                  setInterestRate(opt.rate.toString());
                                  performCalculation(opt.rate);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white font-bold transition-all text-[11px] shadow-2xs border border-amber-200/60"
                                title={`Apply ${opt.tenure} at ${opt.display}`}
                              >
                                <span>{opt.display}</span>
                                <span className="text-[9px] opacity-75">({opt.tenure})</span>
                              </button>
                            ))}
                          </div>
                          {b.selfEmployedFollowOn && (
                            <div className="text-[10px] text-amber-700/80 mt-1 font-mono">
                              Var: {b.selfEmployedFollowOn}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-[11px] text-slate-600 align-top min-w-[220px]">
                          {b.notes || 'Subject to bank approval & credit check.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* History Modal (Accessible from header) */}
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
