import {
  MortgageInputs,
  CalculationResults,
  AmortizationRow,
  YearlyAmortizationRow,
  UpfrontFees,
  PresetRateOption,
  StressTestResults
} from '../types/mortgage';

/**
 * Realistic UAE Bank Rate Presets (seeded with current UAE market benchmarks)
 */
export const UAE_BANK_PRESETS: PresetRateOption[] = [
  {
    id: 'enbd_3yr',
    label: 'Emirates NBD / Mashreq (3-Yr Fixed)',
    description: '4.19% fixed for 3 years, then 3M EIBOR + 2.25% (~6.50%)',
    fixedRate: 4.19,
    fixedYears: 3,
    variableRate: 6.50
  },
  {
    id: 'fab_5yr',
    label: 'First Abu Dhabi Bank (5-Yr Fixed)',
    description: '4.49% fixed for 5 years, then 3M EIBOR + 2.15% (~6.40%)',
    fixedRate: 4.49,
    fixedYears: 5,
    variableRate: 6.40
  },
  {
    id: 'adcb_2yr',
    label: 'ADCB Competitive Fixed (2-Yr Fixed)',
    description: '3.99% fixed for 2 years, then 3M EIBOR + 2.30% (~6.55%)',
    fixedRate: 3.99,
    fixedYears: 2,
    variableRate: 6.55
  },
  {
    id: 'eibor_tracker',
    label: 'Variable EIBOR Tracker (Direct Variable)',
    description: 'No fixed lock-in. 3M EIBOR (4.25%) + 1.75% = 6.00% variable',
    fixedRate: 6.00,
    fixedYears: 1,
    variableRate: 6.00
  },
  {
    id: 'long_fixed',
    label: 'Fully Fixed (Full Tenure)',
    description: '4.85% fixed for the entire duration of the loan',
    fixedRate: 4.85,
    fixedYears: 25,
    variableRate: 4.85
  }
];

/**
 * Formats a number as UAE Dirhams (AED) currency with thousands separators.
 * Example: 2000000 -> "AED 2,000,000"
 * 
 * @param amount - The numeric value to format
 * @param includeDecimals - Whether to format with 2 decimal places (default: false)
 * @returns Formatted AED currency string
 */
export function formatCurrency(amount: number, includeDecimals: boolean = false): string {
  if (isNaN(amount) || !isFinite(amount)) return 'AED 0';
  
  const formatted = new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  }).format(amount);

  return `AED ${formatted}`;
}

/**
 * Formats a number as an integer or decimal with commas without currency prefix.
 * 
 * @param val - The numeric value
 * @param decimals - Decimal places
 * @returns Formatted number string
 */
export function formatNumber(val: number, decimals: number = 0): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
}

/**
 * Determines the UAE Central Bank Loan-to-Value (LTV) limits and minimum down payment requirements.
 * Rules:
 * - UAE residents (and nationals):
 *     Property <= AED 5,000,000 => 85% LTV (Min 15% Down Payment)
 *     Property >  AED 5,000,000 => 75% LTV (Min 25% Down Payment)
 * - Non-residents / Expats (first property or non-resident buyer rules):
 *     Property <= AED 5,000,000 => 80% LTV (Min 20% Down Payment)
 *     Property >  AED 5,000,000 => 70% LTV (Min 30% Down Payment)
 * 
 * @param propertyPrice - Property purchase price in AED
 * @param residencyStatus - 'resident' or 'non_resident'
 * @returns Object containing min down payment percentage, min amount in AED, and max LTV percent
 */
export function getUaeCentralBankLtvRules(propertyPrice: number, residencyStatus: 'resident' | 'non_resident') {
  const isHighValue = propertyPrice > 5000000;
  let maxLtvPercent = 85;
  let minDownPaymentPercent = 15;

  if (residencyStatus === 'resident') {
    if (isHighValue) {
      maxLtvPercent = 75;
      minDownPaymentPercent = 25;
    } else {
      maxLtvPercent = 85;
      minDownPaymentPercent = 15;
    }
  } else {
    // Non-resident
    if (isHighValue) {
      maxLtvPercent = 70;
      minDownPaymentPercent = 30;
    } else {
      maxLtvPercent = 80;
      minDownPaymentPercent = 20;
    }
  }

  const minDownPaymentAmount = (propertyPrice * minDownPaymentPercent) / 100;

  return {
    maxLtvPercent,
    minDownPaymentPercent,
    minDownPaymentAmount
  };
}

/**
 * Standard reducing-balance EMI formula calculation:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * 
 * @param principal - Outstanding loan balance
 * @param annualRatePercent - Annual interest rate in percent (e.g., 4.5 for 4.5%)
 * @param totalMonths - Remaining tenure in months
 * @returns Monthly EMI amount in AED
 */
export function calculateEMI(principal: number, annualRatePercent: number, totalMonths: number): number {
  if (principal <= 0 || totalMonths <= 0) return 0;
  if (annualRatePercent <= 0) {
    return principal / totalMonths;
  }

  const monthlyRate = annualRatePercent / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);

  return isNaN(emi) || !isFinite(emi) ? 0 : emi;
}

/**
 * Reverse calculation: computes maximum loan principal from target monthly EMI.
 * P = EMI * ((1 + r)^n - 1) / (r * (1 + r)^n)
 * 
 * @param emi - Target monthly EMI in AED
 * @param annualRatePercent - Annual interest rate percentage
 * @param totalMonths - Tenure in months
 * @returns Maximum affordable loan principal
 */
export function calculatePrincipalFromEMI(emi: number, annualRatePercent: number, totalMonths: number): number {
  if (emi <= 0 || totalMonths <= 0) return 0;
  if (annualRatePercent <= 0) return emi * totalMonths;

  const monthlyRate = annualRatePercent / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const principal = emi * (factor - 1) / (monthlyRate * factor);

  return isNaN(principal) || !isFinite(principal) ? 0 : Math.round(principal);
}

/**
 * Calculates all UAE upfront acquisition fees and mandatory transaction costs:
 * - DLD Transfer Fee: 4% of property price
 * - DLD Admin / Title Deed Fee: AED 580
 * - Real Estate Agency Commission: 2% of price + 5% VAT
 * - Bank Arrangement / Processing Fee: 1% of loan amount + 5% VAT (min AED 10,000 typical)
 * - Property Valuation: AED 3,000 + 5% VAT (AED 3,150)
 * - Mortgage Registration: 0.25% of loan + AED 290
 * - Registration Trustee Office Fee: AED 4,000 + 5% VAT (AED 4,200)
 * - Estimated Annual Property & Life Insurance: ~0.3% of loan balance
 * 
 * @param propertyPrice - Property purchase price in AED
 * @param loanAmount - Mortgage loan amount in AED
 * @returns Structured breakdown of upfront fees
 */
export function calculateUaeFees(propertyPrice: number, loanAmount: number): UpfrontFees {
  if (propertyPrice <= 0 && loanAmount <= 0) {
    return {
      dldTransferFee: 0,
      dldAdminFee: 0,
      agencyCommission: 0,
      bankArrangementFee: 0,
      propertyValuation: 0,
      mortgageRegistration: 0,
      trusteeFee: 0,
      estimatedInsuranceAnnual: 0,
      totalFeesOnly: 0
    };
  }

  const dldTransferFee = propertyPrice * 0.04;
  const dldAdminFee = propertyPrice > 0 ? 580 : 0;
  const agencyCommission = propertyPrice * 0.02 * 1.05; // 2% + 5% VAT
  const rawBankFee = loanAmount > 0 ? Math.max(10000, loanAmount * 0.01) : 0;
  const bankArrangementFee = rawBankFee > 0 ? rawBankFee * 1.05 : 0; // + 5% VAT
  const propertyValuation = loanAmount > 0 ? 3000 * 1.05 : 0; // AED 3,150
  const mortgageRegistration = loanAmount > 0 ? (loanAmount * 0.0025) + 290 : 0;
  const trusteeFee = propertyPrice >= 500000 ? 4000 * 1.05 : (propertyPrice > 0 ? 2000 * 1.05 : 0); // Trustee fee
  const estimatedInsuranceAnnual = loanAmount * 0.003; // ~0.3% approx p.a.

  const totalFeesOnly = 
    dldTransferFee +
    dldAdminFee +
    agencyCommission +
    bankArrangementFee +
    propertyValuation +
    mortgageRegistration +
    trusteeFee;

  return {
    dldTransferFee,
    dldAdminFee,
    agencyCommission,
    bankArrangementFee,
    propertyValuation,
    mortgageRegistration,
    trusteeFee,
    estimatedInsuranceAnnual,
    totalFeesOnly
  };
}

/**
 * Builds the complete month-by-month and year-by-year amortization schedule,
 * handling the fixed-rate to variable-rate switch seamlessly at year Y.
 * 
 * At month (fixedYears * 12 + 1), the remaining balance is amortized over the
 * remaining months using the variable interest rate.
 * 
 * @param inputs - Full mortgage inputs
 * @returns Complete amortization schedule and aggregated yearly schedule
 */
export function buildAmortizationSchedule(inputs: MortgageInputs): {
  monthlySchedule: AmortizationRow[];
  yearlySchedule: YearlyAmortizationRow[];
  initialEMI: number;
  secondaryEMI: number;
  totalInterestPaid: number;
  totalAmountPayable: number;
} {
  const {
    propertyPrice,
    downPaymentAmount,
    tenureYears,
    interestType,
    rateStructure,
    initialRate,
    fixedYears,
    variableRate,
    flatRate
  } = inputs;

  const totalMonths = inputs.tenureUnit === 'months' 
    ? Math.max(1, inputs.tenureMonths || inputs.tenureYears * 12) 
    : Math.max(1, inputs.tenureYears * 12);
  const effectiveTenureYears = totalMonths / 12;

  const loanAmount = Math.max(0, propertyPrice - downPaymentAmount);
  if (loanAmount <= 0) {
    return {
      monthlySchedule: [],
      yearlySchedule: [],
      initialEMI: 0,
      secondaryEMI: 0,
      totalInterestPaid: 0,
      totalAmountPayable: 0
    };
  }
  const monthlySchedule: AmortizationRow[] = [];

  // Flat Rate Calculation
  if (interestType === 'flat') {
    const totalInterest = loanAmount * (flatRate / 100) * effectiveTenureYears;
    const totalPayable = loanAmount + totalInterest;
    const monthlyEMI = totalPayable / totalMonths;
    const monthlyPrincipal = loanAmount / totalMonths;
    const monthlyInterest = totalInterest / totalMonths;

    let balance = loanAmount;
    for (let m = 1; m <= totalMonths; m++) {
      balance = Math.max(0, balance - monthlyPrincipal);
      monthlySchedule.push({
        month: m,
        year: Math.ceil(m / 12),
        payment: monthlyEMI,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        remainingBalance: balance,
        rateApplied: flatRate
      });
    }

    const yearlySchedule = aggregateYearlySchedule(monthlySchedule);
    return {
      monthlySchedule,
      yearlySchedule,
      initialEMI: monthlyEMI,
      secondaryEMI: monthlyEMI,
      totalInterestPaid: totalInterest,
      totalAmountPayable: totalPayable
    };
  }

  // Reducing Balance Calculation with Fixed -> Variable Switch
  const isSplit = rateStructure === 'fixed_variable' && fixedYears < effectiveTenureYears;
  const switchMonth = isSplit ? fixedYears * 12 : totalMonths;

  // Calculate Initial EMI for the entire tenure at initialRate
  const initialEMI = calculateEMI(loanAmount, initialRate, totalMonths);

  let currentBalance = loanAmount;
  let currentEMI = initialEMI;
  let currentRate = initialRate;
  let secondaryEMI = initialEMI;

  let totalInterestAccumulator = 0;

  for (let m = 1; m <= totalMonths; m++) {
    // If we crossed into the variable rate period
    if (isSplit && m === switchMonth + 1) {
      currentRate = variableRate;
      const remainingMonths = totalMonths - switchMonth;
      // Recalculate EMI for remaining balance at new variable rate
      currentEMI = calculateEMI(currentBalance, currentRate, remainingMonths);
      secondaryEMI = currentEMI;
    }

    const monthlyInterestRate = currentRate / 12 / 100;
    const interestPayment = currentBalance * monthlyInterestRate;
    let principalPayment = currentEMI - interestPayment;

    // Handle last month rounding
    if (m === totalMonths || principalPayment > currentBalance) {
      principalPayment = currentBalance;
      currentEMI = principalPayment + interestPayment;
      currentBalance = 0;
    } else {
      currentBalance = Math.max(0, currentBalance - principalPayment);
    }

    totalInterestAccumulator += interestPayment;

    monthlySchedule.push({
      month: m,
      year: Math.ceil(m / 12),
      payment: currentEMI,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: currentBalance,
      rateApplied: currentRate
    });
  }

  const yearlySchedule = aggregateYearlySchedule(monthlySchedule);
  const totalAmountPayable = loanAmount + totalInterestAccumulator;

  return {
    monthlySchedule,
    yearlySchedule,
    initialEMI,
    secondaryEMI: isSplit ? secondaryEMI : initialEMI,
    totalInterestPaid: totalInterestAccumulator,
    totalAmountPayable
  };
}

/**
 * Aggregates monthly amortization entries into an annual year-by-year summary.
 */
function aggregateYearlySchedule(monthly: AmortizationRow[]): YearlyAmortizationRow[] {
  const yearlyMap = new Map<number, YearlyAmortizationRow>();

  for (const row of monthly) {
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
    yr.effectiveRate = row.rateApplied;
  }

  return Array.from(yearlyMap.values());
}

/**
 * Orchestrates full mortgage calculations including LTV checks, DBR affordability,
 * amortization schedules, and acquisition fee summaries.
 * 
 * @param inputs - Mortgage input configuration
 * @returns Comprehensive calculation outputs
 */
export function calculateMortgage(inputs: MortgageInputs): CalculationResults {
  const totalMonths = inputs.tenureUnit === 'months' 
    ? Math.max(1, inputs.tenureMonths || inputs.tenureYears * 12) 
    : Math.max(1, inputs.tenureYears * 12);
  const effectiveTenureYears = totalMonths / 12;

  let activeInputs = { ...inputs };
  if (inputs.calculationMode === 'target_emi' && inputs.targetEMI > 0) {
    const computedLoan = calculatePrincipalFromEMI(inputs.targetEMI, inputs.initialRate, totalMonths);
    const downPct = inputs.downPaymentPercent > 0 ? inputs.downPaymentPercent : 20;
    const ltv = (100 - downPct) / 100;
    const computedPrice = ltv > 0 ? Math.round(computedLoan / ltv) : computedLoan;
    const computedDown = computedPrice - computedLoan;
    activeInputs = {
      ...inputs,
      propertyPrice: computedPrice,
      downPaymentAmount: computedDown
    };
  }

  const loanAmount = Math.max(0, activeInputs.propertyPrice - activeInputs.downPaymentAmount);
  
  // Central Bank LTV limits
  const ltvRules = getUaeCentralBankLtvRules(activeInputs.propertyPrice, activeInputs.residencyStatus);
  const isDownPaymentValid = activeInputs.downPaymentPercent >= ltvRules.minDownPaymentPercent;

  // Schedule & EMI
  const scheduleResult = buildAmortizationSchedule(activeInputs);

  // DBR Check (Debt Burden Ratio)
  // Monthly obligations = Initial EMI + existing monthly debts
  const totalMonthlyCommitment = scheduleResult.initialEMI + (activeInputs.existingDebts || 0);
  const dbrRatio = activeInputs.monthlyIncome > 0 ? (totalMonthlyCommitment / activeInputs.monthlyIncome) * 100 : 0;
  const isDbrExceeded = dbrRatio > 50;

  // Upfront Fees
  const upfrontFees = calculateUaeFees(activeInputs.propertyPrice, loanAmount);
  const totalUpfrontCashNeeded = activeInputs.downPaymentAmount + upfrontFees.totalFeesOnly;

  // Principal vs Interest percentage split
  const totalPayable = scheduleResult.totalAmountPayable;
  const principalPercentage = totalPayable > 0 ? (loanAmount / totalPayable) * 100 : 0;
  const interestPercentage = totalPayable > 0 ? (scheduleResult.totalInterestPaid / totalPayable) * 100 : 0;

  // UAE Central Bank Mandatory +2% Interest Rate Stress Test
  // CBUAE regulations require banks to test affordability with at least a 200 bps (+2%) rate cushion
  const buffer = activeInputs.stressTestBuffer ?? 2.0;
  const stressedInputs: MortgageInputs = {
    ...activeInputs,
    initialRate: activeInputs.initialRate + buffer,
    variableRate: activeInputs.variableRate + buffer,
    flatRate: activeInputs.flatRate + buffer
  };
  const stressedSchedule = buildAmortizationSchedule(stressedInputs);
  const stressedMonthlyEMI = stressedSchedule.initialEMI;
  const monthlyDifference = stressedMonthlyEMI - scheduleResult.initialEMI;
  const percentIncrease = scheduleResult.initialEMI > 0 ? (monthlyDifference / scheduleResult.initialEMI) * 100 : 0;
  const stressedTotalCommitment = stressedMonthlyEMI + (activeInputs.existingDebts || 0);
  const stressedDbrRatio = activeInputs.monthlyIncome > 0 ? (stressedTotalCommitment / activeInputs.monthlyIncome) * 100 : 0;
  const isStressedDbrExceeded = stressedDbrRatio > 50;
  const maxAllowedDebt = activeInputs.monthlyIncome * 0.5;
  const stressedHeadroom = maxAllowedDebt - stressedTotalCommitment;

  const stressTest: StressTestResults = {
    bufferPercent: buffer,
    stressedInitialRate: activeInputs.initialRate + buffer,
    stressedVariableRate: activeInputs.variableRate + buffer,
    stressedMonthlyEMI,
    stressedSecondaryEMI: stressedSchedule.secondaryEMI,
    monthlyDifference,
    percentIncrease,
    stressedTotalInterest: stressedSchedule.totalInterestPaid,
    stressedTotalPayable: stressedSchedule.totalAmountPayable,
    additionalLifetimeInterest: stressedSchedule.totalInterestPaid - scheduleResult.totalInterestPaid,
    stressedDbrRatio,
    isStressedDbrExceeded,
    stressedHeadroom
  };

  return {
    loanAmount,
    initialMonthlyEMI: scheduleResult.initialEMI,
    secondaryMonthlyEMI: scheduleResult.secondaryEMI,
    effectiveMonthlyEMI: scheduleResult.initialEMI,
    hasVariableSwitch: activeInputs.rateStructure === 'fixed_variable' && activeInputs.fixedYears < effectiveTenureYears && activeInputs.interestType === 'reducing',
    totalInterestPaid: scheduleResult.totalInterestPaid,
    totalAmountPayable: scheduleResult.totalAmountPayable,
    principalPercentage,
    interestPercentage,
    amortizationSchedule: scheduleResult.monthlySchedule,
    yearlySchedule: scheduleResult.yearlySchedule,
    minDownPaymentPercent: ltvRules.minDownPaymentPercent,
    minDownPaymentAmount: ltvRules.minDownPaymentAmount,
    maxLtvPercent: ltvRules.maxLtvPercent,
    isDownPaymentValid,
    dbrRatio,
    isDbrExceeded,
    upfrontFees,
    totalUpfrontCashNeeded,
    stressTest
  };
}

/**
 * Exports amortization schedule rows to a downloadable CSV file.
 */
export function exportAmortizationToCSV(
  schedule: AmortizationRow[] | YearlyAmortizationRow[],
  type: 'monthly' | 'yearly',
  propertyPrice: number,
  loanAmount: number
): void {
  let headers: string[];
  let rows: string[][];

  if (type === 'monthly') {
    headers = ['Month', 'Year', 'Payment (AED)', 'Principal (AED)', 'Interest (AED)', 'Remaining Balance (AED)', 'Rate (%)'];
    rows = (schedule as AmortizationRow[]).map(row => [
      row.month.toString(),
      row.year.toString(),
      row.payment.toFixed(2),
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.remainingBalance.toFixed(2),
      row.rateApplied.toFixed(2)
    ]);
  } else {
    headers = ['Year', 'Annual Payment (AED)', 'Annual Principal (AED)', 'Annual Interest (AED)', 'Ending Balance (AED)', 'Applied Rate (%)'];
    rows = (schedule as YearlyAmortizationRow[]).map(row => [
      row.year.toString(),
      row.totalPayment.toFixed(2),
      row.totalPrincipal.toFixed(2),
      row.totalInterest.toFixed(2),
      row.endingBalance.toFixed(2),
      row.effectiveRate.toFixed(2)
    ]);
  }

  const csvContent = [
    `# UAE Mortgage Amortization Schedule (${type === 'monthly' ? 'Monthly' : 'Yearly'})`,
    `# Property Price: AED ${propertyPrice.toLocaleString()}`,
    `# Loan Amount: AED ${loanAmount.toLocaleString()}`,
    `# Generated on: ${new Date().toLocaleDateString('en-GB')}`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `uae_mortgage_amortization_${type}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
