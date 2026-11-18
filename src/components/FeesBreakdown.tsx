import React, { useState } from 'react';
import { CalculationResults, MortgageInputs } from '../types/mortgage';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { ChevronDown, ChevronUp, Receipt, Shield } from 'lucide-react';

interface FeesBreakdownProps {
  results: CalculationResults;
  inputs: MortgageInputs;
}

export const FeesBreakdown: React.FC<FeesBreakdownProps> = ({ results, inputs }) => {
  const [isOpen, setIsOpen] = useState(true);
  const fees = results.upfrontFees;

  const feeItems = [
    {
      title: 'Dubai Land Department (DLD) Transfer Fee',
      formula: '4% of property price',
      amount: fees.dldTransferFee,
      notes: 'Payable directly to DLD via manager cheque or portal'
    },
    {
      title: 'DLD Admin / Title Deed Fee',
      formula: 'Fixed admin charge',
      amount: fees.dldAdminFee,
      notes: 'Title deed issuance and document fee'
    },
    {
      title: 'Real Estate Agency Commission',
      formula: '2% of property price + 5% VAT',
      amount: fees.agencyCommission,
      notes: 'Standard certified broker fee'
    },
    {
      title: 'Bank Arrangement / Processing Fee',
      formula: '1% of loan amount + 5% VAT (min AED 10k)',
      amount: fees.bankArrangementFee,
      notes: 'Payable to the lending bank upon final offer letter'
    },
    {
      title: 'Property Valuation Fee',
      formula: 'AED 3,000 + 5% VAT',
      amount: fees.propertyValuation,
      notes: 'Independent surveyor valuation for bank approval'
    },
    {
      title: 'Mortgage Registration Fee',
      formula: '0.25% of loan amount + AED 290 admin',
      amount: fees.mortgageRegistration,
      notes: 'Registered at DLD to secure bank charge'
    },
    {
      title: 'Registration Trustee Office Fee',
      formula: 'AED 4,000 + 5% VAT',
      amount: fees.trusteeFee,
      notes: 'Payable at authorized Real Estate Registration Trustee'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden print-break-inside-avoid">
      {/* Header Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              UAE Fees &amp; Acquisition Costs Breakdown
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {formatCurrency(fees.totalFeesOnly)}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Mandatory government, broker, and bank charges required to close
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-medium hidden sm:inline text-slate-500">
            {isOpen ? 'Collapse' : 'Expand details'}
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-6 pt-2 border-t border-slate-100 space-y-6">
          
          {/* Fee Table */}
          <div className="divide-y divide-slate-100 text-sm">
            {feeItems.map((item, index) => (
              <div key={index} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                <div>
                  <div className="font-semibold text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>{item.formula}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400">{item.notes}</span>
                  </div>
                </div>
                <div className="font-mono-numbers font-bold text-slate-900 sm:text-right shrink-0">
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}

            {/* Recurring Life & Home Insurance Note */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-amber-50/40 px-2 rounded-lg text-amber-900">
              <div>
                <div className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Life &amp; Property Insurance (Recurring)
                </div>
                <div className="text-xs text-amber-800">
                  Estimated ~0.3% p.a. of loan balance (~AED {formatNumber(fees.estimatedInsuranceAnnual / 12)} / month)
                </div>
              </div>
              <div className="font-mono-numbers font-semibold text-xs text-amber-800 sm:text-right shrink-0">
                ~{formatCurrency(fees.estimatedInsuranceAnnual)} / yr
              </div>
            </div>
          </div>

          {/* Upfront Cash Total Highlight Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-purple-200">
                  Total Upfront Capital Required
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono-numbers mt-0.5 text-white">
                  {formatCurrency(results.totalUpfrontCashNeeded)}
                </div>
                <p className="text-xs text-purple-200/90 mt-1">
                  Down Payment ({formatCurrency(inputs.downPaymentAmount)}) + Total One-Time Purchase Fees ({formatCurrency(fees.totalFeesOnly)})
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 text-xs text-purple-100 max-w-xs space-y-1">
                <div className="flex justify-between">
                  <span>Down Payment:</span>
                  <span className="font-bold">{formatCurrency(inputs.downPaymentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Purchase Fees (~{((fees.totalFeesOnly / inputs.propertyPrice) * 100).toFixed(1)}%):</span>
                  <span className="font-bold">{formatCurrency(fees.totalFeesOnly)}</span>
                </div>
                <div className="border-t border-white/20 pt-1 flex justify-between font-bold text-white">
                  <span>Net Required:</span>
                  <span>{formatCurrency(results.totalUpfrontCashNeeded)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
