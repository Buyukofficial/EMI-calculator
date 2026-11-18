import React, { useState, useMemo } from 'react';
import { MortgageInputs } from './types/mortgage';
import { calculateMortgage } from './utils/calculations';
import { Header } from './components/Header';
import { HeroCalculatorTop } from './components/HeroCalculatorTop';
import { SummaryCards } from './components/SummaryCards';
import { DbrCheck } from './components/DbrCheck';
import { StressTestCard } from './components/StressTestCard';
import { FeesBreakdown } from './components/FeesBreakdown';
import { MortgageChart } from './components/MortgageChart';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { HelpModals, HelpTopic } from './components/HelpModals';
import { ShieldCheck } from 'lucide-react';

const DEFAULT_INPUTS: MortgageInputs = {
  propertyPrice: 2000000,
  downPaymentPercent: 20,
  downPaymentAmount: 400000,
  residencyStatus: 'resident',
  tenureYears: 25,
  tenureMonths: 300,
  tenureUnit: 'years',
  calculationMode: 'loan_amount',
  targetEMI: 8614,
  paymentFrequency: 'monthly',
  interestType: 'reducing',
  rateStructure: 'fixed_variable',
  initialRate: 4.19,
  fixedYears: 3,
  variableRate: 6.50,
  flatRate: 2.75,
  monthlyIncome: 35000,
  existingDebts: 2500,
  stressTestBuffer: 2.0
};

export const App: React.FC = () => {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULT_INPUTS);
  const [helpTopic, setHelpTopic] = useState<HelpTopic>(null);

  // Partial update handler for inputs
  const handleInputChange = (updates: Partial<MortgageInputs>) => {
    setInputs(prev => ({ ...prev, ...updates }));
  };

  // Reset to UAE default benchmark values
  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  // Print or save as PDF
  const handlePrint = () => {
    window.print();
  };

  // Memoized full mortgage calculation results
  const results = useMemo(() => {
    return calculateMortgage(inputs);
  }, [inputs]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header bar */}
      <Header
        onReset={handleReset}
        onPrint={handlePrint}
        onOpenHelp={() => setHelpTopic('all')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top-Level Hero Input Console: Loan Amount -> Interest Rate -> Tenure -> Stress Rate -> Eligibility */}
        <HeroCalculatorTop
          inputs={inputs}
          results={results}
          onChange={handleInputChange}
          onOpenHelp={(topic) => setHelpTopic(topic)}
        />

        {/* 4 Hero Summary Cards */}
        <SummaryCards
          results={results}
          inputs={inputs}
          onOpenEmiHelp={() => setHelpTopic('emi')}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Affordability, Stress Testing & UAE Fees */}
          <div className="lg:col-span-7 space-y-6">
            <DbrCheck
              inputs={inputs}
              results={results}
              onChange={handleInputChange}
              onOpenDbrHelp={() => setHelpTopic('dbr')}
            />

            <StressTestCard
              inputs={inputs}
              results={results}
              onChange={handleInputChange}
              onOpenStressHelp={() => setHelpTopic('stress')}
            />

            <FeesBreakdown
              results={results}
              inputs={inputs}
            />
          </div>

          {/* Right Column: Visual Charts */}
          <div className="lg:col-span-5 space-y-6">
            <MortgageChart
              results={results}
              inputs={inputs}
            />
          </div>

        </div>

        {/* Full-width Amortization Schedule */}
        <AmortizationSchedule
          results={results}
          inputs={inputs}
        />

      </main>

      {/* Knowledge Base Modal */}
      <HelpModals
        topic={helpTopic}
        onClose={() => setHelpTopic(null)}
      />

      {/* Disclaimer Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>UAE Mortgage Regulatory &amp; Calculation Notice</span>
          </div>

          <p className="leading-relaxed text-slate-500">
            <strong>Disclaimer:</strong> This calculator provides indicative estimates based on prevailing UAE Central Bank (CBUAE) mortgage guidelines, Dubai Land Department (DLD) transfer fee schedules, and standard retail banking amortization practices. Actual interest rates, processing fees, loan-to-value limits, and insurance premiums may vary depending on the lender, applicant credit rating (AECB score), employer categorization, and property valuation. This tool does not constitute official financial advice or a binding loan offer.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-100 text-slate-400 text-[11px]">
            <div>UAE Central Bank LTV: 85% / 75% (Residents) &bull; 80% / 70% (Non-residents) &bull; DBR Cap: 50% &bull; CBUAE +2% Stress Tested</div>
            <div>Built for UAE Homebuyers &bull; 100% Client-Side</div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
