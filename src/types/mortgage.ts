/**
 * UAE Mortgage Calculator Types
 */

export type ResidencyStatus = 'resident' | 'non_resident';

export type InterestType = 'reducing' | 'flat';

export type RateStructure = 'fixed_variable' | 'fixed_only';

export type CalculationMode = 'loan_amount' | 'target_emi';

export type PaymentFrequency = 'monthly' | 'biweekly';

export type TenureUnit = 'years' | 'months';

export interface MortgageInputs {
  propertyPrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  residencyStatus: ResidencyStatus;
  tenureYears: number;
  tenureMonths: number;
  tenureUnit: TenureUnit;
  calculationMode: CalculationMode;
  targetEMI: number;
  paymentFrequency: PaymentFrequency;
  interestType: InterestType;
  rateStructure: RateStructure;
  initialRate: number; // e.g. 4.19
  fixedYears: number;  // e.g. 3
  variableRate: number; // e.g. 6.50
  flatRate: number;    // e.g. 2.75
  monthlyIncome: number; // e.g. 35,000
  existingDebts: number; // e.g. 2,500
  stressTestBuffer: number; // e.g. 2.0 (% interest rate stress buffer per CBUAE guidelines)
}

export interface StressTestResults {
  bufferPercent: number;
  stressedInitialRate: number;
  stressedVariableRate: number;
  stressedMonthlyEMI: number;
  stressedSecondaryEMI: number;
  monthlyDifference: number;
  percentIncrease: number;
  stressedTotalInterest: number;
  stressedTotalPayable: number;
  additionalLifetimeInterest: number;
  stressedDbrRatio: number;
  isStressedDbrExceeded: boolean;
  stressedHeadroom: number;
}

export interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  rateApplied: number;
}

export interface YearlyAmortizationRow {
  year: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  endingBalance: number;
  effectiveRate: number;
}

export interface CalculationResults {
  loanAmount: number;
  initialMonthlyEMI: number;
  secondaryMonthlyEMI: number;
  effectiveMonthlyEMI: number; // for initial comparison
  hasVariableSwitch: boolean;
  totalInterestPaid: number;
  totalAmountPayable: number;
  principalPercentage: number;
  interestPercentage: number;
  amortizationSchedule: AmortizationRow[];
  yearlySchedule: YearlyAmortizationRow[];
  minDownPaymentPercent: number;
  minDownPaymentAmount: number;
  maxLtvPercent: number;
  isDownPaymentValid: boolean;
  dbrRatio: number; // Debt Burden Ratio percentage
  isDbrExceeded: boolean;
  upfrontFees: UpfrontFees;
  totalUpfrontCashNeeded: number;
  stressTest: StressTestResults;
}

export interface UpfrontFees {
  dldTransferFee: number; // 4% of price
  dldAdminFee: number; // AED 580
  agencyCommission: number; // 2% of price + 5% VAT
  bankArrangementFee: number; // 1% of loan, min 10,000 + 5% VAT
  propertyValuation: number; // AED 3,150 (3,000 + 5% VAT)
  mortgageRegistration: number; // 0.25% of loan + AED 290
  trusteeFee: number; // AED 4,200 (4,000 + 5% VAT)
  estimatedInsuranceAnnual: number; // ~0.3% of loan / life & property
  totalFeesOnly: number;
}

export interface PresetRateOption {
  id: string;
  label: string;
  description: string;
  fixedRate: number;
  fixedYears: number;
  variableRate: number;
}
