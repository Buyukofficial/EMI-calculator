import React from 'react';
import { X, BookOpen, ShieldCheck, Scale, Calculator, Zap } from 'lucide-react';

export type HelpTopic = 'emi' | 'dbr' | 'ltv' | 'stress' | 'all' | null;

interface HelpModalsProps {
  topic: HelpTopic;
  onClose: () => void;
}

export const HelpModals: React.FC<HelpModalsProps> = ({ topic, onClose }) => {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              UAE Mortgage Knowledge Base &amp; Rules
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          
          {/* Section 1: What is EMI? */}
          {(topic === 'emi' || topic === 'all') && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Calculator className="w-4 h-4 text-emerald-600" />
                What is EMI (Equated Monthly Installment)?
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                EMI is the fixed monthly payment made by a borrower to the bank on a specified date every month.
                Each EMI includes both <strong>principal repayment</strong> and <strong>interest accrued</strong>.
              </p>
              <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-slate-800 space-y-1">
                <div className="font-bold">Standard Reducing-Balance Formula:</div>
                <div className="text-emerald-700">EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]</div>
                <div className="text-[11px] text-slate-500 font-sans">
                  Where: P = Loan Principal, r = Monthly Interest Rate (Annual Rate ÷ 12 ÷ 100), n = Total Tenure in Months.
                </div>
              </div>
              <p className="text-xs text-slate-500">
                In the earlier years of the mortgage, the majority of your EMI payment goes toward interest. Over time, as the principal balance decreases, the interest portion declines and principal repayment increases.
              </p>
            </div>
          )}

          {/* Section 2: UAE Central Bank LTV Rules */}
          {(topic === 'ltv' || topic === 'all') && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Scale className="w-4 h-4 text-emerald-600" />
                UAE Central Bank Loan-to-Value (LTV) Limits
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm">
                The Central Bank of the UAE (CBUAE) mandates strict maximum Loan-to-Value ratios to ensure stability in the property market:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">UAE Residents &amp; Nationals</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Properties ≤ AED 5M: <strong>85% Max LTV</strong> (15% min down payment)</li>
                    <li>Properties &gt; AED 5M: <strong>75% Max LTV</strong> (25% min down payment)</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Non-Residents &amp; Expats</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Properties ≤ AED 5M: <strong>80% Max LTV</strong> (20% min down payment)</li>
                    <li>Properties &gt; AED 5M: <strong>70% Max LTV</strong> (30% min down payment)</li>
                  </ul>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                *Note: Maximum mortgage tenure in the UAE is 25 years (maximum age at mortgage maturity is typically 65 for salaried expats and 70 for UAE nationals/self-employed).
              </p>
            </div>
          )}

          {/* Section 3: DBR (Debt Burden Ratio) */}
          {(topic === 'dbr' || topic === 'all') && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                What is DBR (Debt Burden Ratio)?
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                DBR represents the percentage of your monthly income that goes toward servicing all debt commitments.
                The <strong>Central Bank of the UAE caps DBR at a strict maximum of 50%</strong>.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 space-y-1 border border-amber-200">
                <div className="font-bold">What is counted in your DBR?</div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Your proposed new mortgage monthly EMI</li>
                  <li>Auto / car loan monthly installments</li>
                  <li>Personal loan monthly installments</li>
                  <li><strong>5% of your total credit card limits</strong> (regardless of whether you have an active balance)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 4: 2% Interest Rate Stress Test */}
          {(topic === 'stress' || topic === 'all') && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Zap className="w-4 h-4 text-amber-600" />
                UAE Central Bank +2% Interest Rate Stress Test
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                When applying for a mortgage in the UAE, banks do not just check whether you can afford the initial fixed or promotional interest rate. Under CBUAE underwriting standards, banks are required to <strong>stress test your affordability by adding a 2.0% (200 bps) interest rate buffer</strong>.
              </p>
              <div className="p-3 bg-amber-50/80 rounded-xl text-xs text-amber-950 space-y-1.5 border border-amber-200">
                <div className="font-bold text-amber-900">How the Stress Test Works:</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
                  <li>If your mortgage interest rate is 4.19%, the bank calculates your monthly EMI at <strong>6.19%</strong>.</li>
                  <li>The bank then calculates your <strong>Stressed Debt Burden Ratio (DBR)</strong> using this higher EMI.</li>
                  <li>If your stressed DBR exceeds the <strong>50% Central Bank ceiling</strong>, the bank may reduce your eligible loan amount or decline the application unless debts are paid off or income is supplemented.</li>
                </ul>
              </div>
              <p className="text-[11px] text-slate-500">
                This rule shields homeowners from payment shock when fixed-rate periods end and variable rates adjust with the Emirates Interbank Offered Rate (EIBOR).
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Got it, close
          </button>
        </div>

      </div>
    </div>
  );
};
